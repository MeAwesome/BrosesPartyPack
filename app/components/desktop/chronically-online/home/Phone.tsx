import { animated, SpringValue } from "@react-spring/three";
import { Center, Gltf, RoundedBox, Text3D } from "@react-three/drei";

export default function Phone({
	loaderData,
	state,
	syncedColor,
	reverseSyncedColor,
	position,
	rotation,
	roomCode
}: {
	readonly loaderData: any;
	readonly state: number;
	readonly syncedColor: SpringValue<string>;
	readonly reverseSyncedColor: SpringValue<string>;
	readonly position: SpringValue<number[]>;
	readonly rotation: SpringValue<number[]>;
	readonly roomCode: string | null;
}) {
	return (
		<animated.group position={position} rotation={rotation}>
			<Gltf src="/.proxy/models/phone.gltf" scale={35} rotation={[1.4, 0.2, -0.4]} position={[-4, 0.3, 0]} />
			<RoundedBox args={[2.3, 5, 0.06]} position={[-3.855, 0.3, 0.28]} rotation={[-0.26, 0.4, 0.22]}>
				<meshBasicMaterial color="#222222" />
			</RoundedBox>

			{state == 0 && <HomeState loaderData={loaderData} reverseSyncedColor={reverseSyncedColor} />}
			{state == 1 && <ConnectingState loaderData={loaderData} reverseSyncedColor={reverseSyncedColor} />}
			{state == 2 && 
				<CodeState loaderData={loaderData} syncedColor={syncedColor} reverseSyncedColor={reverseSyncedColor} roomCode={roomCode}/>
			}
			{state == 3 && <ExitingState loaderData={loaderData} reverseSyncedColor={reverseSyncedColor} />}
		</animated.group>
	);
}

function HomeState({
	loaderData,
	reverseSyncedColor
}: {
	readonly loaderData: any;
	readonly reverseSyncedColor: SpringValue<string>;
}) {
	return (
		<Center front position={[-4.1, 1.5, 0.1]} rotation={[1.4, 0.2, -0.4]}>
			<Text3D font={loaderData.fonts.monoton} size={0.2} height={0.045} rotation={[-1.6, 0, 0]}>
				{"Chronically\nOnline"}
				<animated.meshBasicMaterial color={reverseSyncedColor} />
			</Text3D>
		</Center>
	);
}

function ConnectingState({
	loaderData,
	reverseSyncedColor
}: {
	readonly loaderData: any;
	readonly reverseSyncedColor: SpringValue<string>;
}) {
	return (
		<Center front position={[-4.1, 1.5, 0.1]} rotation={[1.4, 0.2, -0.4]}>
			<Text3D font={loaderData.fonts.monoton} size={0.2} height={0.045} rotation={[-1.6, 0, 0]}>
				{"Connecting\nTo Server"}
				<animated.meshBasicMaterial color={reverseSyncedColor} />
			</Text3D>
		</Center>
	);
}

function CodeState({
	loaderData,
	syncedColor,
	reverseSyncedColor,
	roomCode
}: {
	readonly loaderData: any;
	readonly syncedColor: SpringValue<string>;
	readonly reverseSyncedColor: SpringValue<string>;
	readonly roomCode: string | null;
}) {
	return (
		<group>
			<Center front position={[-4.475, 1.5, 0.3]} rotation={[1.4, 0.2, -0.4]}>
				<Text3D font={loaderData.fonts.monoton} size={0.15} height={0.01} rotation={[-1.555, 0.01, 0]}>
					{"GO TO\n\nAND ENTER\nTHE CODE"}
					<animated.meshBasicMaterial color={reverseSyncedColor} />
				</Text3D>
			</Center>
			<Center front position={[-4.05, 1.23, 0.15]} rotation={[1.4, 0.2, -0.4]}>
				<Text3D font={loaderData.fonts.monoton} size={0.15} height={0.01} rotation={[-1.555, 0.01, 0]}>
					{"BPP.MEAWESO.ME"}
					<animated.meshBasicMaterial color={syncedColor} />
				</Text3D>
			</Center>
			<Center right front position={[-4.8, 0.15, 0.8]} rotation={[1.4, 0.2, -0.4]}>
				<Text3D font={loaderData.fonts.monoton} size={0.325} height={0.01} rotation={[-1.555, 0.01, 0]}>
					{roomCode}
					<animated.meshBasicMaterial color={syncedColor} />
				</Text3D>
			</Center>
		</group>
	);
}

function ExitingState({
	loaderData,
	reverseSyncedColor
}: {
	readonly loaderData: any;
	readonly reverseSyncedColor: SpringValue<string>;
}) {
	return (
		<Center front position={[-4.5, 1.5, 0.3]} rotation={[1.4, 0.2, -0.4]}>
			<Text3D font={loaderData.fonts.monoton} size={0.2} height={0.045} rotation={[-1.6, 0, 0]}>
				{"Exiting\nRoom"}
				<animated.meshBasicMaterial color={reverseSyncedColor} />
			</Text3D>
		</Center>
	);
}