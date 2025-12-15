import { useMenu } from "~/hooks/use-menu";
import { useSocket } from "~/hooks/use-socket";
import { Button } from "../../shadcn/ui/button";
import { useState } from "react";

export default function Home() {
	const { setSubMenu, menuData } = useMenu();
	const socket = useSocket();
	const [emitReadyOnClick, setEmitReadyOnClick] = useState(true);

	socket.on("game/start", () => {
		setSubMenu("blank");
	});

	return (
		menuData.isHost && (
			<div className="flex flex-col justify-center items-center size-full">
				<Button
					className="w-1/2 h-12 bg-[#F26419] hover:bg-[#F26419] text-white font-bold"
					onClick={() => {
						setEmitReadyOnClick(!emitReadyOnClick);
						if (emitReadyOnClick) {
							socket.emit("room/ready");
						} else {
							socket.emit("room/unready");
						}
					}}
				>
					{emitReadyOnClick ? "Everybody's Ready" : "Stop Countdown"}
				</Button>
			</div>
		)
	);
}
