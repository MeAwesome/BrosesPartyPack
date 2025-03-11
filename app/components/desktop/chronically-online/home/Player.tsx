import { Center, MeshDistortMaterial, Sphere, Text, Text3D } from "@react-three/drei";
import { animated, SpringValue } from "@react-spring/three";

const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial);

export default function Player({
	position,
	blobColor,
	textColor,
	name,
	loaderData
}: {
	readonly position: [x: number, y: number, z: number];
	readonly blobColor: SpringValue<string>;
	readonly textColor: SpringValue<string>;
	readonly name: string;
	readonly loaderData: any;
}) {
	return (
		<group position={position} rotation={[0, Math.PI / 2, 0]}>
			<Sphere args={[0.8, 100, 100]}>
				<AnimatedMeshDistortMaterial speed={5} distort={0.5} color={name == null ? "#787F87" : blobColor} />
			</Sphere>
			<Center front position={[0, -1.5, 0]} cacheKey={name}>
				<Text3D font={loaderData.fonts.audiowide} size={0.2} height={0.01}>
					{name}
					<animated.meshBasicMaterial color={name == null ? "#787F87" : textColor} />
				</Text3D>
			</Center>
		</group>
	);
}
