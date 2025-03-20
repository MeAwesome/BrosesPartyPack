import { CameraControls, Hud } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Flex } from "@react-three/flex";
import { useEffect, useRef, useState } from "react";
import Phone from "~/components/desktop/chronically-online/home/Phone";
import MenuOption from "~/components/desktop/chronically-online/home/MenuOption";
import { useEventListener } from "usehooks-ts";
import { useMenu } from "~/hooks/use-menu";
import Background from "~/components/desktop/chronically-online/home/Background";
import Blob from "~/components/desktop/chronically-online/home/Blob";
import { useSpring, useSpringRef } from "@react-spring/three";
import { useSocket } from "~/hooks/use-socket";
import { Howl } from "howler";
import Player from "~/components/desktop/chronically-online/home/Player";
import {
	PlayerCreateData,
	RoomCreatedData,
	RoomJoinSuccessData,
	RoomReconnectedData
} from "@/services/GameService/types";
import proxyURL from "~/lib/proxyURL";

export default function Home({ loaderData }: { readonly loaderData: any }) {
	const { setMenu } = useMenu();
	const socket = useSocket();
	const cameraRef = useRef<CameraControls>(null);
	const [selectedOption, setSelectedOption] = useState(0);
	const [freezeSelection, setFreezeSelection] = useState(false);
	const [freezeBack, setFreezeBack] = useState(false);
	const camera = useThree((state) => state.camera);
	const [phoneState, setPhoneState] = useState(0);
	const phoneApi = useSpringRef();
	const [roomCode, setRoomCode] = useState<string | null>(null);
	const [showPlayers, setShowPlayers] = useState(false);
	const [players, setPlayers] = useState<string[]>(Array.from({ length: 10 }));
	const playerPositions = [
		[0, 6, -13],
		[0, 5, -17],
		[0, 6, -21],
		[0, 2, -12],
		[0, 1, -16],
		[0, 2, -20],
		[0, -1, -23],
		[0, -2, -14],
		[0, -3, -18],
		[0, -4, -22]
	];

	const [backgroundColorSpring] = useSpring(
		() => ({
			from: {
				color: "#1296E3"
			},
			to: {
				color: "#F26419"
			},
			delay: 5000,
			loop: {
				reverse: true
			},
			config: {
				duration: 5000
			}
		}),
		[]
	);

	const [phoneColorSpring] = useSpring(
		() => ({
			from: {
				color: "#F26419"
			},
			to: {
				color: "#1296E3"
			},
			delay: 5000,
			loop: {
				reverse: true
			},
			config: {
				duration: 5000
			}
		}),
		[]
	);

	const [phonePositionSpring] = useSpring(
		() => ({
			from: {
				position: [0, 0, 0],
				rotation: [0, 0, 0]
			},
			to: {
				position: [5, 0, -12],
				rotation: [0, Math.PI / 2, 0]
			},
			reverse: phoneState >= 2,
			ref: phoneApi
		}),
		[phoneState]
	);

	const [backgroundMusic] = useState<Howl>(
		new Howl({
			src: [proxyURL("/audio/music/chronically-online-main-theme.mp3")],
			loop: true
		})
	);

	const [playerJoinSFX] = useState<Howl>(
		new Howl({
			src: [proxyURL("/audio/sfx/chronicallyonline/player-join.mp3")]
		})
	);

	function updatePlayers(players: PlayerCreateData[]) {
		const playerNames = players.map((player) => player.playerName);
		playerNames.push(...Array(10 - playerNames.length).fill(null));
		setPlayers(playerNames);
	}

	socket.on("room/create/success", (data: RoomCreatedData) => {
		cameraRef.current?.moveTo(5, 0, -12, true).then(() => {
			setShowPlayers(true);
		});
		cameraRef.current?.rotateTo(Math.PI / 2, Math.PI / 2, true);
		setRoomCode(data.roomCode);
		setPhoneState(2);
		setSelectedOption(-1);
	});

	socket.on("room/destroy/success", () => {
		setShowPlayers(false);
		setPlayers(Array.from({ length: 10 }));
		setRoomCode(null);
		setPhoneState(0);
		cameraRef.current?.moveTo(0, 0, 0, true).then(() => {
			setFreezeBack(false);
			setSelectedOption(0);
			setFreezeSelection(false);
		});
		cameraRef.current?.rotateTo(0, Math.PI / 2, true);
	});

	socket.on("room/join/success", (data: RoomJoinSuccessData) => {
		playerJoinSFX.play();
		updatePlayers(data.players);
	});

	socket.on("room/reconnect/success", (data: RoomReconnectedData) => {
		updatePlayers(data.players);
	});

	socket.on("game/start", () => {
		setMenu("temp");
	});

	useEventListener("keydown", (e) => {
		if (e.key == "ArrowDown" && !freezeSelection) {
			setSelectedOption((selectedOption + 1) % 3);
		} else if (e.key == "ArrowUp" && !freezeSelection) {
			setSelectedOption((selectedOption - 1 + 3) % 3);
		} else if (e.key == "Enter" && !freezeSelection) {
			setFreezeSelection(true);
			if (selectedOption == 0) {
				setPhoneState(1);
				socket.emit("room/create", {
					gameID: "chronicallyonline"
				});
			} else if (selectedOption == 1) {
				// TODO: Implement settings
			} else if (selectedOption == 2) {
				backgroundMusic.stop();
				setMenu("main");
			}
		} else if (e.key == "Backspace" && freezeSelection && !freezeBack) {
			setFreezeBack(true);
			setPhoneState(3);
			socket.emit("room/destroy");
		}
	});

	useEffect(() => {
		backgroundMusic.play();
		return () => {
			backgroundMusic.stop();
		};
	}, []);

	return (
		<>
			<Background color={backgroundColorSpring.color} />
			<Phone
				loaderData={loaderData}
				state={phoneState}
				syncedColor={backgroundColorSpring.color}
				reverseSyncedColor={phoneColorSpring.color}
				position={phonePositionSpring.position}
				rotation={phonePositionSpring.rotation}
				roomCode={roomCode}
			/>
			<Blob color={backgroundColorSpring.color} />
			<Flex justifyContent="center" alignItems="flex-end" position={[8, 0, 0]} rotation={[0, -0.4, 0]}>
				<MenuOption option={"PLAY"} selected={selectedOption == 0} loaderData={loaderData} />
				<MenuOption option={"SETTINGS"} selected={selectedOption == 1} loaderData={loaderData} />
				<MenuOption option={"QUIT"} selected={selectedOption == 2} loaderData={loaderData} />
			</Flex>
			<Hud renderPriority={showPlayers ? 1 : 0}>
				{/* eslint-disable-next-line react/no-unknown-property */}
				<ambientLight intensity={3.1} />
				{players.map((player, index) => (
					<Player
						key={index}
						position={playerPositions[index] as [number, number, number]}
						blobColor={backgroundColorSpring.color}
						textColor={index == 0 ? "#F6AE2D" : phoneColorSpring.color}
						name={player}
						loaderData={loaderData}
					/>
				))}
			</Hud>
			<CameraControls camera={camera} ref={cameraRef} />
		</>
	);
}
