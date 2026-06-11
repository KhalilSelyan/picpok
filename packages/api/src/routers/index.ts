import { env } from "@picpok/env/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

const feedInput = z.object({
	page: z.number().int().min(1).default(1),
	perPage: z.number().int().min(1).max(30).default(10),
});

const likeInput = z.object({
	imageId: z.string().min(1),
	liked: z.boolean(),
});

const pexelsPhotoSchema = z.object({
	id: z.number(),
	width: z.number(),
	height: z.number(),
	url: z.string(),
	photographer: z.string(),
	alt: z.string().nullable().optional(),
	src: z.object({
		large2x: z.string().optional(),
		large: z.string().optional(),
		portrait: z.string().optional(),
		original: z.string().optional(),
	}),
});

const pexelsResponseSchema = z.object({
	page: z.number(),
	per_page: z.number(),
	total_results: z.number(),
	next_page: z.string().optional(),
	photos: z.array(pexelsPhotoSchema),
});

async function fetchPexelsPhotos(input: z.infer<typeof feedInput>) {
	const url = new URL(`${env.PEXELS_API_BASE_URL}/curated`);
	url.searchParams.set("page", String(input.page));
	url.searchParams.set("per_page", String(input.perPage));

	const response = await fetch(url, {
		headers: {
			Authorization: env.PEXELS_API_KEY,
		},
	});

	if (!response.ok) {
		throw new TRPCError({
			code: "BAD_GATEWAY",
			message: `Pexels request failed with status ${response.status}`,
		});
	}

	const parsed = pexelsResponseSchema.safeParse(await response.json());

	if (!parsed.success) {
		throw new TRPCError({
			code: "BAD_GATEWAY",
			message: "Pexels returned an unexpected response",
			cause: parsed.error,
		});
	}

	return parsed.data;
}

function normalizePexelsPhoto(photo: z.infer<typeof pexelsPhotoSchema>) {
	return {
		id: String(photo.id),
		photographer: photo.photographer,
		width: photo.width,
		height: photo.height,
		imageUrl: photo.src.large2x ?? photo.src.large ?? photo.src.portrait ?? photo.src.original ?? "",
		alt: photo.alt || `Photo by ${photo.photographer}`,
		sourceUrl: photo.url,
	};
}

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	feed: router({
		list: publicProcedure.input(feedInput).query(async ({ ctx, input }) => {
			const pexels = await fetchPexelsPhotos(input);
			const images = pexels.photos.map(normalizePexelsPhoto).filter((image) => image.imageUrl);
			const imageIds = images.map((image) => image.id);
			const likedIds = new Set<string>();

			if (ctx.session && imageIds.length > 0) {
				const rows = await ctx.feedDb.listLikedImageIds(ctx.session.user.id, imageIds);

				for (const row of rows) {
					likedIds.add(row.imageId);
				}
			}

			return {
				page: pexels.page,
				perPage: pexels.per_page,
				totalResults: pexels.total_results,
				nextPage: pexels.next_page ? input.page + 1 : null,
				images: images.map((image) => ({
					...image,
					liked: likedIds.has(image.id),
				})),
			};
		}),
	}),
	likes: router({
		set: protectedProcedure.input(likeInput).mutation(async ({ ctx, input }) => {
			return ctx.feedDb.setLike({
				userId: ctx.session.user.id,
				imageId: input.imageId,
				liked: input.liked,
			});
		}),
	}),
});
export type AppRouter = typeof appRouter;
