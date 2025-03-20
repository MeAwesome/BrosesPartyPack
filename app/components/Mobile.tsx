import { useMenu } from "~/hooks/use-menu";
import MainMenu from "~/components/mobile/MainMenu";
import Error from "~/components/Error";
import ChronicallyOnline from "~/components/mobile/ChronicallyOnline";
import { useEventListener, useReadLocalStorage } from "usehooks-ts";
import { useSocket } from "~/hooks/use-socket";

export default function Mobile() {
	const { menu, setMenu } = useMenu();
	const savedCode = useReadLocalStorage("code");
	const socket = useSocket();

	useEventListener("visibilitychange", () => {
		setMenu("main");
		socket.emit("room/search", {
			roomCode: savedCode
		});
	});

	switch (menu) {
		case "main":
			return <MainMenu />;
		case "chronicallyonline":
			return <ChronicallyOnline />;
		default:
			return <Error />;
	}
}
