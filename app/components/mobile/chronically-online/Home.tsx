import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { useMenu } from "~/hooks/use-menu";
import { useSocket } from "~/hooks/use-socket";
import { Button } from "../../shadcn/ui/button";

export default function Home() {
	const { setMenu, menuData } = useMenu();
	const [, setSavedCode] = useLocalStorage("code", "");
	const name = useReadLocalStorage<string>("name");
	const socket = useSocket();

	socket.on("room/destroy/success", () => {
		setSavedCode("");
		setMenu("main");
	});

	return (
		<div className="fixed inset-0 flex flex-col size-full bg-[#1296E3] text-white">
			<nav className="flex justify-evenly items-center h-12.5 bg-[#F26419]">
				<h1 className="text-2xl font-black">{name}</h1>
			</nav>
			<div className="flex flex-grow">
				{menuData.isHost && (
					<div className="flex flex-col justify-center items-center size-full">
						<Button
							className="w-1/2 h-12 bg-[#F26419] text-white font-bold"
							onClick={() => {
								socket.emit("room/ready");
							}}
						>
							Everybody&apos;s In
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
