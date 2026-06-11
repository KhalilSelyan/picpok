import { Button } from "@picpok/ui/components/button";
import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	Heart,
	ImageOff,
	Loader2,
	LogIn,
	LogOut,
	RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { useTRPCClient } from "@/utils/trpc";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

type FeedImage = {
	id: string;
	photographer: string;
	width: number;
	height: number;
	imageUrl: string;
	alt: string;
	sourceUrl: string;
	liked: boolean;
};

type FeedPage = {
	page: number;
	perPage: number;
	totalResults: number;
	nextPage: number | null;
	images: FeedImage[];
};

const FEED_QUERY_KEY = ["feed", "list"] as const;
const PENDING_LIKE_KEY = "picpok:pending-like-image-id";
const ESTIMATED_ITEM_HEIGHT = 800;

function HomeComponent() {
	const trpcClient = useTRPCClient();
	const queryClient = useQueryClient();
	const feedScrollRef = useRef<HTMLDivElement | null>(null);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const didReplayPendingLikeRef = useRef(false);
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	const feedQuery = useInfiniteQuery({
		queryKey: FEED_QUERY_KEY,
		initialPageParam: 1,
		queryFn: ({ pageParam }) =>
			trpcClient.feed.list.query({ page: pageParam, perPage: 10 }),
		getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
	});

	const likeMutation = useMutation({
		mutationFn: (input: { imageId: string; liked: boolean }) =>
			trpcClient.likes.set.mutate(input),
		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });

			const previous =
				queryClient.getQueryData<InfiniteData<FeedPage, number>>(
					FEED_QUERY_KEY,
				);

			queryClient.setQueryData<InfiniteData<FeedPage, number>>(
				FEED_QUERY_KEY,
				(current) => {
					if (!current) {
						return current;
					}

					return {
						...current,
						pages: current.pages.map((page) => ({
							...page,
							images: page.images.map((image) =>
								image.id === input.imageId
									? { ...image, liked: input.liked }
									: image,
							),
						})),
					};
				},
			);

			return { previous };
		},
		onError: (error, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(FEED_QUERY_KEY, context.previous);
			}

			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
		},
	});

	useEffect(() => {
		const node = loadMoreRef.current;

		if (!node || !feedQuery.hasNextPage || feedQuery.isFetchingNextPage) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					feedQuery.fetchNextPage();
				}
			},
			{ rootMargin: "600px 0px" },
		);

		observer.observe(node);

		return () => observer.disconnect();
	}, [
		feedQuery.hasNextPage,
		feedQuery.isFetchingNextPage,
		feedQuery.fetchNextPage,
	]);

	const images = feedQuery.data?.pages.flatMap((page) => page.images) ?? [];
	const virtualizer = useVirtualizer({
		count: images.length,
		getScrollElement: () => feedScrollRef.current,
		estimateSize: () =>
			feedScrollRef.current?.clientHeight ?? ESTIMATED_ITEM_HEIGHT,
		overscan: 2,
	});
	const virtualItems = virtualizer.getVirtualItems();

	useEffect(() => {
		for (const image of images.slice(1, 4)) {
			const preload = new Image();
			preload.src = image.imageUrl;
		}
	}, [images]);

	useEffect(() => {
		virtualizer.measure();
	}, [virtualizer]);

	useEffect(() => {
		if (!session || didReplayPendingLikeRef.current) {
			return;
		}

		const pendingImageId = sessionStorage.getItem(PENDING_LIKE_KEY);

		if (!pendingImageId) {
			return;
		}

		didReplayPendingLikeRef.current = true;
		sessionStorage.removeItem(PENDING_LIKE_KEY);
		likeMutation.mutate({ imageId: pendingImageId, liked: true });
	}, [session, likeMutation]);

	function handleLike(image: FeedImage) {
		if (!session) {
			sessionStorage.setItem(PENDING_LIKE_KEY, image.id);
			window.location.href = "/login";
			return;
		}

		likeMutation.mutate({ imageId: image.id, liked: !image.liked });
	}

	function handleSignOut() {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: FEED_QUERY_KEY,
					});
				},
			},
		});
	}

	return (
		<main className="min-h-dvh bg-black text-white">
			<section className="relative mx-auto h-dvh w-full max-w-md overflow-hidden border-white/10 border-x bg-zinc-950">
				<AuthPill
					isPending={isSessionPending}
					username={session?.user.name}
					onSignOut={handleSignOut}
				/>

				{feedQuery.isPending ? <FeedStatus label="Loading photos" /> : null}

				{feedQuery.isError ? (
					<FeedStatus label="Could not load the feed">
						<Button
							type="button"
							variant="outline"
							className="border-white/20 bg-white/10 text-white hover:bg-white/20"
							onClick={() => feedQuery.refetch()}
						>
							<RefreshCw className="size-4" />
							Retry
						</Button>
					</FeedStatus>
				) : null}

				{!feedQuery.isPending && !feedQuery.isError && images.length === 0 ? (
					<FeedStatus label="No photos found" />
				) : null}

				{images.length > 0 ? (
					<div
						ref={feedScrollRef}
						className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth"
					>
						<div
							className="relative w-full"
							style={{ height: `${virtualizer.getTotalSize()}px` }}
						>
							{virtualItems.map((virtualItem) => {
								const image = images[virtualItem.index];

								if (!image) {
									return null;
								}

								return (
									<div
										key={virtualItem.key}
										className="absolute top-0 left-0 w-full snap-start snap-always"
										style={{
											height: `${virtualItem.size}px`,
											transform: `translateY(${virtualItem.start}px)`,
										}}
									>
										<FeedItem
											image={image}
											isLiking={
												likeMutation.isPending &&
												likeMutation.variables?.imageId === image.id
											}
											onLike={() => handleLike(image)}
										/>
									</div>
								);
							})}
						</div>
						<div ref={loadMoreRef} className="h-px" />
						{feedQuery.isFetchingNextPage ? (
							<div className="flex h-16 items-center justify-center text-white/50 text-xs">
								<Loader2 className="mr-2 size-4 animate-spin" />
								Loading more
							</div>
						) : null}
					</div>
				) : null}
			</section>
		</main>
	);
}

function AuthPill({
	isPending,
	username,
	onSignOut,
}: {
	isPending: boolean;
	username?: string | null;
	onSignOut: () => void;
}) {
	return (
		<div className="pointer-events-none absolute top-4 right-4 z-20 pt-[env(safe-area-inset-top)]">
			{isPending ? (
				<div className="h-8 w-20 animate-pulse rounded-full bg-white/15" />
			) : username ? (
				<Button
					type="button"
					variant="outline"
					className="pointer-events-auto rounded-full border-white/15 bg-black/35 px-3 text-white backdrop-blur-md hover:bg-white/15"
					onClick={onSignOut}
				>
					<span className="max-w-24 truncate">{username}</span>
					<LogOut className="size-3.5" />
				</Button>
			) : (
				<a href="/login" className="pointer-events-auto">
					<Button
						type="button"
						variant="outline"
						className="rounded-full border-white/15 bg-black/35 px-3 text-white backdrop-blur-md hover:bg-white/15"
					>
						<LogIn className="size-3.5" />
						Log in
					</Button>
				</a>
			)}
		</div>
	);
}

function FeedItem({
	image,
	isLiking,
	onLike,
}: {
	image: FeedImage;
	isLiking: boolean;
	onLike: () => void;
}) {
	const [didImageFail, setDidImageFail] = useState(false);

	return (
		<article className="relative h-dvh snap-start snap-always overflow-hidden bg-zinc-950">
			{didImageFail ? (
				<div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32rem)] px-8 text-center">
					<div className="space-y-3 text-white/70">
						<ImageOff className="mx-auto size-10 text-white/40" />
						<p className="font-semibold text-lg text-white">
							Photo unavailable
						</p>
						<p className="text-sm">
							Pexels returned an image that could not be loaded.
						</p>
					</div>
				</div>
			) : (
				<img
					src={image.imageUrl}
					alt={image.alt}
					className="h-full w-full object-cover"
					loading="lazy"
					onError={() => setDidImageFail(true)}
				/>
			)}
			<div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
			<div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/75 to-transparent" />

			<div className="absolute right-4 bottom-24 z-10 pb-[env(safe-area-inset-bottom)]">
				<Button
					type="button"
					aria-pressed={image.liked}
					size="icon-lg"
					className="size-12 rounded-full border-white/15 bg-black/35 text-white shadow-2xl backdrop-blur-md hover:bg-white/15"
					disabled={isLiking}
					onClick={onLike}
				>
					{isLiking ? (
						<Loader2 className="size-5 animate-spin" />
					) : (
						<Heart
							className={`size-6 ${image.liked ? "fill-red-500 text-red-500" : "text-white"}`}
						/>
					)}
				</Button>
			</div>

			<div className="absolute bottom-6 left-4 z-10 max-w-[72%] pb-[env(safe-area-inset-bottom)]">
				<p className="font-semibold text-sm drop-shadow">
					{image.photographer}
				</p>
				<a
					href={image.sourceUrl}
					target="_blank"
					rel="noreferrer"
					className="text-white/60 text-xs underline-offset-4 hover:underline"
				>
					View on Pexels
				</a>
			</div>
		</article>
	);
}

function FeedStatus({
	children,
	label,
}: {
	children?: React.ReactNode;
	label: string;
}) {
	return (
		<div className="flex h-dvh items-center justify-center px-6 text-center">
			<div className="space-y-4">
				<p className="font-semibold text-sm text-white/50 uppercase tracking-[0.35em]">
					Picpok
				</p>
				<div className="space-y-3">
					<Loader2 className="mx-auto size-5 animate-spin text-white/50" />
					<p className="font-medium text-lg">{label}</p>
					{children}
				</div>
			</div>
		</div>
	);
}
