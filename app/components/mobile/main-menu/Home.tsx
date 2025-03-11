import { useMenu } from "~/hooks/use-menu";
import { Button } from "~/components/shadcn/ui/button";
import { ScrollArea } from "~/components/shadcn/ui/scroll-area";
import RoomCodeInput from "~/components/mobile/main-menu/home/RoomCodeInput";
import NameInput from "~/components/mobile/main-menu/home/NameInput";
import MeAwesomeGamesLogo from "~/components/mobile/main-menu/home/MeAwesomeGamesLogo";
import ImageCarousel from "~/components/mobile/main-menu/home/ImageCarousel";
import PreviousGames from "~/components/mobile/main-menu/home/PreviousGames";
import { Suspense, useEffect, useState } from "react";
import { useSocket } from "~/hooks/use-socket";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { RoomJoinErrorData, RoomJoinSuccessData, RoomReconnectedData, RoomSearchErrorData, RoomSearchSuccessData } from "@/services/GameService/types";

export default function Home() {
	const { setMenu } = useMenu();
	const socket = useSocket();
	
	const deviceID = useReadLocalStorage("deviceID");
	const [savedCode, setSavedCode] = useLocalStorage("code", "");
	const [savedName, setSavedName] = useLocalStorage("name", "");
	const [roomCode, setRoomCode] = useState(savedCode ?? "");
	const [name, setName] = useState(savedName ?? "");
	const [gameName, setGameName] = useState("");
	const [charsLeft, setCharsLeft] = useState(12);
	const [buttonDisabled, setButtonDisabled] = useState(true);

	socket.on("room/search/success", (data: RoomSearchSuccessData) => {
		setGameName(data.gameName);
	});

	socket.on("room/search/error", (error: RoomSearchErrorData) => {
		setGameName(error.message);
	});

	socket.on("room/join/success", (data: RoomJoinSuccessData) => {
		setSavedCode(data.roomCode);
		setSavedName(data.playerName);
		setMenu(data.gameMeta.id);
	});

	socket.on("room/reconnected", (data: RoomReconnectedData) => {
		setSavedCode(data.roomCode);
		setSavedName(data.playerName);
		setMenu(data.gameMeta.id);
	});

	socket.on("room/join/error", (error: RoomJoinErrorData) => {
		setSavedCode("");
		setRoomCode("");
	});

	useEffect(() => {
		if (roomCode.length === 4) {
			socket.emit("room/search", {
				roomCode: roomCode
			});
		} else {
			setGameName("");
		}
	}, [roomCode]);

	useEffect(() => {
		setCharsLeft(12 - name.length);
	}, [name]);

	useEffect(() => {
		setButtonDisabled(roomCode.length !== 4 || name.length === 0 || gameName === "" || gameName === "Room not found");
	}, [roomCode, name, gameName]);

	return (
		<div className="fixed inset-0 size-full bg-[#0a1420] text-white">
			<nav className="flex justify-evenly items-center h-12.5 bg-[#4254F4]">
				<h1 className="text-2xl font-black italic">bpp.meaweso.me</h1>
			</nav>
			<ScrollArea className="size-full" id="main-menu-home-scroll-area">
				<div className="flex flex-col justify-start items-center h-3/7 w-full">
					<div className="flex flex-col justify-evenly items-center h-full w-11/12 max-w-sm">
						<RoomCodeInput code={roomCode} onCodeUpdate={setRoomCode} gameName={gameName} />
						<NameInput name={name} onNameUpdate={setName} charsLeft={charsLeft} />
						<Button
							className={`hover:bg-[${buttonDisabled ? "#1F2937" : "#4254F4"}] bg-[${buttonDisabled ? "#1F2937" : "#4254F4"}] text-white font-bold w-4/5 h-12.5 rounded-lg text-xl`}
							onClick={() => {
								socket.emit("room/join", {
									deviceID: deviceID,
									roomCode: roomCode,
									playerName: name
								});
							}}
							disabled={buttonDisabled}
						>
							{(roomCode !== "" && roomCode == savedCode) ? "RECONNECT" : "PLAY"}
						</Button>
						<p className="text-xs font-light text-nowrap">
							By clicking PLAY, you agree to our{" "}
							<a href="https://cat-bounce.com" className="text-blue-500">
								Terms of Service
							</a>
						</p>
					</div>
				</div>
				<ImageCarousel />
				<Suspense fallback={<MeAwesomeGamesLogo />}>
					<PreviousGames />
				</Suspense>
			</ScrollArea>
		</div>
	);
}
