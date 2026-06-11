import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<main className="min-h-dvh bg-black text-white">
			<section className="relative mx-auto flex min-h-dvh w-full max-w-md items-center border-white/10 border-x bg-zinc-950 px-6 py-10">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_28rem)]" />
				<div className="relative w-full">
					{showSignIn ? (
						<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
					) : (
						<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
					)}
				</div>
			</section>
		</main>
	);
}
