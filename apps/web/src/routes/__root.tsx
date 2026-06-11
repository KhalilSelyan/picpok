import type { AppRouter } from "@picpok/api/routers/index";
import { Toaster } from "@picpok/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import appCss from "../index.css?url";
export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Picpok",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	const showDevtools = import.meta.env.DEV;

	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body>
				<Outlet />
				<Toaster richColors />
				{showDevtools ? (
					<>
						<TanStackRouterDevtools position="bottom-left" />
						<ReactQueryDevtools
							position="bottom"
							buttonPosition="bottom-right"
						/>
					</>
				) : null}
				<Scripts />
			</body>
		</html>
	);
}
