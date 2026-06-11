import { Button } from "@picpok/ui/components/button";
import { Input } from "@picpok/ui/components/input";
import { Label } from "@picpok/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			username: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.username(
				{
					username: value.username,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/",
						});
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				username: z
					.string()
					.min(3, "Username must be at least 3 characters")
					.max(24, "Username must be at most 24 characters")
					.regex(
						/^[a-z0-9_]+$/,
						"Use lowercase letters, numbers, and underscores",
					),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="w-full space-y-8">
			<div className="space-y-3 text-center">
				<p className="font-semibold text-sm text-white/50 uppercase tracking-[0.35em]">
					Picpok
				</p>
				<h1 className="font-bold text-4xl tracking-tight">Welcome back</h1>
				<p className="text-sm text-white/55">
					Sign in to save likes across refreshes.
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-5"
			>
				<div className="space-y-1.5">
					<form.Field name="username">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-white/70">
									Username
								</Label>
								<Input
									id={field.name}
									name={field.name}
									autoCapitalize="none"
									autoComplete="username"
									className="h-12 border-white/10 bg-white/10 text-white placeholder:text-white/30"
									placeholder="your_username"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(e.target.value.toLowerCase())
									}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-300 text-xs">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div className="space-y-1.5">
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-white/70">
									Password
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autoComplete="current-password"
									className="h-12 border-white/10 bg-white/10 text-white placeholder:text-white/30"
									placeholder="At least 8 characters"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-300 text-xs">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							type="submit"
							className="h-12 w-full rounded-full bg-white text-black hover:bg-white/85"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Submitting..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="space-y-3 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignUp}
					className="text-white/70 hover:text-white"
				>
					Need an account? Sign up
				</Button>
				<div>
					<Link
						to="/"
						className="text-white/40 text-xs underline-offset-4 hover:text-white/70 hover:underline"
					>
						Back to feed
					</Link>
				</div>
			</div>
		</div>
	);
}
