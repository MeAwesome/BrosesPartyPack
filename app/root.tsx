import { Links, Meta, Outlet, Scripts, useLoaderData } from "@remix-run/react";
import globalStylesheet from "~/global.css?url";
import { SocketProvider } from "~/providers/socket-provider";
import config from "@/core/util/config";
import { MenuProvider } from "~/providers/menu-provider";
import slickStylesheet from "slick-carousel/slick/slick.css?url";
import slickThemeStylesheet from "slick-carousel/slick/slick-theme.css?url";

export function meta() {
	return [{ title: "Node FullStack Template" }];
}

export function links() {
	return [
		{ rel: "stylesheet", href: globalStylesheet },
		{ rel: "stylesheet", href: slickStylesheet },
		{ rel: "stylesheet", href: slickThemeStylesheet },
		{ rel: "icon", href: "data:image/x-icon;base64,AA" }
	];
}

export function loader() {
	return {
		enablePWA: config.enablePWA,
		websocketConfig: config.services.core.websocket
	};
}

export default function Root() {
	const config = useLoaderData<typeof loader>();
	return (
		<html lang="en" className="dark">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0"
				/>
				<Meta />
				{config.enablePWA && <link rel="manifest" href="/manifest.webmanifest" />}
				<Links />
			</head>
			<body>
				<SocketProvider config={config.websocketConfig}>
					<MenuProvider>
						<Outlet />
					</MenuProvider>
				</SocketProvider>
				<Scripts />
			</body>
		</html>
	);
}
