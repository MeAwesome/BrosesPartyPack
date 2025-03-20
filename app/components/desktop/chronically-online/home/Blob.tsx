import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import { animated, SpringValue } from "@react-spring/three";

const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial);

export default function Blob({ color }: { readonly color: SpringValue<string> }) {
	return (
		<Sphere position={[0, 0, -20]} args={[10, 100, 200]}>
			<AnimatedMeshDistortMaterial speed={5} distort={0.5} color={color} />
		</Sphere>
	);
}
