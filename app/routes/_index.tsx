import { useEffect, useState } from "react";
import { useSocket } from "~/hooks/use-socket";
import { useLocalStorage } from "usehooks-ts";
import ShortUniqueId from "short-unique-id";
import Mobile from "~/components/Mobile";
import Desktop from "~/components/Desktop";
import { useLoaderData } from "@remix-run/react";

export function meta() {
	return [{ title: "Broses Party Pack" }];
}

export async function loader() {
	return {
		meta: (await import("../../server/services/GameService/meta.json")).default,
		fonts: {
			herticalsans: (await import("../../public/fonts/herticalsans.json")).default,
			monoton: (await import("../../public/fonts/monoton.json")).default,
		}
	};
}

export default function Index() {
	const loaderData = useLoaderData<typeof loader>();
	const [isMobile, setIsMobile] = useState<boolean | null>(null);
	const [deviceID, setDeviceID] = useLocalStorage("deviceID", "");
	const [socketSetup, setSocketSetup] = useState(false);
	const socket = useSocket();

	socket.on("setupClient", () => {
		setSocketSetup(true);
	});

	let content;
	if (isMobile == null || !socketSetup) {
		content = (
			<div className="fixed inset-0 w-full h-full">
				<div className="flex items-center justify-center h-full">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
				</div>
			</div>
		);
	} else if (isMobile) {
		content = <Mobile />;
	} else {
		content = <Desktop loaderData={loaderData} />;
	}

	useEffect(() => {
		const testResult = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator?.userAgent);
		const isDiscordActivity = window.location.href.includes("discordsays.com");
		setIsMobile(testResult && !isDiscordActivity);
		let uuid = deviceID;
		if (!uuid) {
			uuid = new ShortUniqueId().randomUUID(32);
			setDeviceID(uuid);
		}
		socket.emit("setupClient", uuid, testResult ? "mobile" : "desktop");
	}, []);

	return content;
}
