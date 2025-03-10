import { animated, SpringValue } from "@react-spring/three";
import { Center, Gltf, RoundedBox, Text3D } from "@react-three/drei";

export default function Phone({
	loaderData,
	state,
	color
}: {
	readonly loaderData: any;
	readonly state: number;
	readonly color: SpringValue<string>;
}) {
	return (
		// eslint-disable-next-line react/no-unknown-property
		<group position={[0, 0, 0]}>
			<Gltf src="/.proxy/models/phone.gltf" scale={35} rotation={[1.4, 0.2, -0.4]} position={[-4, 0.3, 0]} />
			<RoundedBox args={[2.3, 5, 0.06]} position={[-3.855, 0.3, 0.28]} rotation={[-0.26, 0.4, 0.22]}>
				<meshBasicMaterial color="#222222" />
			</RoundedBox>

			{state == 0 && <HomeState loaderData={loaderData} color={color} />}
			{state == 1 && <ConnectingState loaderData={loaderData} color={color} />}
		</group>
	);
}

function HomeState({ loaderData, color }: { readonly loaderData: any; readonly color: SpringValue<string> }) {
	return (
		<Center front position={[-4.1, 1.5, 0.1]} rotation={[1.4, 0.2, -0.4]}>
			<Text3D font={loaderData.fonts.monoton} size={0.2} height={0.045} rotation={[-1.6, 0, 0]}>
				{"Chronically\nOnline"}
				<animated.meshBasicMaterial color={color} />
			</Text3D>
		</Center>
	);
}

function ConnectingState({ loaderData, color }: { readonly loaderData: any, readonly color: SpringValue<string> }) {
	return (
		<Center front position={[-4.1, 1.5, 0.1]} rotation={[1.4, 0.2, -0.4]}>
			<Text3D font={loaderData.fonts.monoton} size={0.2} height={0.045} rotation={[-1.6, 0, 0]}>
				{"Connecting\nTo Server"}
				<animated.meshBasicMaterial color={color} />
			</Text3D>
		</Center>
	);
}