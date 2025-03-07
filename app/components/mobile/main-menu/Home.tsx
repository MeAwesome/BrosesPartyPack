import { useMenu } from "~/hooks/use-menu";
import { Button } from "~/components/shadcn/ui/button";
import { ScrollArea } from "~/components/shadcn/ui/scroll-area";
import RoomCodeInput from "~/components/mobile/main-menu/home/RoomCodeInput";
import NameInput from "~/components/mobile/main-menu/home/NameInput";
import MeAwesomeGamesLogo from "~/components/mobile/main-menu/home/MeAwesomeGamesLogo";
import ImageCarousel from "~/components/mobile/main-menu/home/ImageCarousel";
import PreviousGames from "~/components/mobile/main-menu/home/PreviousGames";
import { Suspense, useEffect, useState } from "react";

export default function Home() {
	const { setMenu } = useMenu();

	const [roomCode, setRoomCode] = useState("");
	const [gameName, setGameName] = useState("");
	const [name, setName] = useState("");
	const [charsLeft, setCharsLeft] = useState(12);

	useEffect(() => {
		if (roomCode.length === 4) {
			setGameName("testing");
		} else {
			setGameName("");
		}
	}, [roomCode]);

	useEffect(() => {
		setCharsLeft(12 - name.length);
	}, [name]);

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
							className="bg-[#4254F4] text-white font-bold w-4/5 h-12.5 rounded-lg text-xl"
							onClick={() => setMenu("insert-game-here")}
						>
							PLAY
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
