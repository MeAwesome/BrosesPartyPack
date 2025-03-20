import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Flex } from "@react-three/flex";
import GameOption from "~/components/desktop/main-menu/home/GameOption";
import { Color } from "three";
import { Key, useEffect, useState } from "react";
import { useEventListener } from "usehooks-ts";
import { Howl } from "howler";
import { useMenu } from "~/hooks/use-menu";
import proxyURL from "~/lib/proxyURL";

export default function Home({ loaderData }: { readonly loaderData: any }) {
	const { meta } = loaderData;
	const { setMenu } = useMenu();

	const [selectedGame, setSelectedGame] = useState(0);
	const [freezeSelection, setFreezeSelection] = useState(false);

	const [backgroundMusicIntro] = useState<Howl>(
		new Howl({
			src: [proxyURL("/audio/music/main-menu-intro.mp3")],
			onend: () => {
				backgroundMusicIntro.stop();
				backgroundMusicLoop.play();
			}
		})
	);
	const [backgroundMusicLoop] = useState<Howl>(
		new Howl({
			src: [proxyURL("/audio/music/main-menu-loop.mp3")],
			loop: true
		})
	);
	const [selectAnotherGameSFX] = useState<Howl>(
		new Howl({
			src: [proxyURL("/audio/sfx/discord-ping.mp3")]
		})
	);
	const [selectGameSFX] = useState<Howl>(
		new Howl({
			src: [proxyURL("/audio/sfx/discord-call-joined.mp3")],
			onplay: () => {
				setFreezeSelection(true);
			}
		})
	);

	useEventListener("keydown", (e) => {
		if (freezeSelection) return;
		if (e.key == "ArrowDown") {
			selectAnotherGameSFX.stop();
			selectAnotherGameSFX.play();
			setSelectedGame((selectedGame + 1) % meta.length);
		} else if (e.key == "ArrowUp") {
			selectAnotherGameSFX.stop();
			selectAnotherGameSFX.play();
			setSelectedGame((selectedGame - 1 + meta.length) % meta.length);
		} else if (e.key == "Enter") {
			backgroundMusicIntro.stop();
			backgroundMusicLoop.stop();
			selectAnotherGameSFX.stop();
			selectGameSFX.stop();
			selectGameSFX.on("end", () => {
				setMenu(meta[selectedGame].id);
			});
			selectGameSFX.play();
		}
	});

	useEffect(() => {
		backgroundMusicIntro.play();
		return () => {
			selectAnotherGameSFX.stop();
			selectGameSFX.stop();
			backgroundMusicIntro.stop();
			backgroundMusicLoop.stop();
		};
	}, []);

	return (
		<>
			<Background />
			<Flex justifyContent="center" alignItems="flex-start" position={[-4, 0, 0]} rotation={[0, 0.4, 0]}>
				{meta.map((game: { id: Key | null | undefined; name: string }, index: number) => (
					<GameOption
						key={game.id}
						gameName={game.name}
						selected={selectedGame == index}
						loaderData={loaderData}
					/>
				))}
			</Flex>
			<CameraControls />
		</>
	);
}

function Background() {
	const { scene } = useThree();
	scene.background = new Color("#313338");
	return null;
}
