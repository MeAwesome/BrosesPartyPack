import { useMenu } from "~/hooks/use-menu";
import Home from "~/components/mobile/chronically-online/Home";
import Error from "~/components/Error";
import { useLocalStorage } from "usehooks-ts";
import { useSocket } from "~/hooks/use-socket";

export default function ChronicallyOnline() {
	const { subMenu, menuData, resetMenu } = useMenu();
	const [, setSavedCode] = useLocalStorage("code", "");
	const socket = useSocket();

	socket.on("room/destroy/success", () => {
		setSavedCode("");
		resetMenu();
	});

	let content;
	switch (subMenu) {
		case "home":
			content = <Home />;
			break;
		case "blank":
			content = <></>;
			break;
		default:
			return <Error />;
	}

	return (
		<div className="fixed inset-0 flex flex-col size-full bg-[#1296E3] text-white">
			<nav className="flex justify-evenly items-center h-12.5 bg-[#F26419]">
				<h1 className="text-2xl font-black">{menuData.playerName}</h1>
			</nav>
			<div className="flex flex-grow">{content}</div>
		</div>
	);
}
