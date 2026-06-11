import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto flex h-dvh w-full max-w-md items-center justify-center border-white/10 border-x bg-zinc-950 px-6 text-center">
        <div className="space-y-4">
          <p className="font-semibold text-sm uppercase tracking-[0.35em] text-white/50">
            Picpok
          </p>
          <h1 className="font-bold text-4xl tracking-tight">Photo feed coming next.</h1>
          <p className="text-sm text-white/60">
            This route will become the full-screen snap-scrolling Pexels feed.
          </p>
        </div>
      </div>
    </main>
  );
}
