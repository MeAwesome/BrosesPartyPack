import { Center, RoundedBox, Text3D, useTexture, MeshDistortMaterial, Sphere, Outlines } from "@react-three/drei";
import { Box } from "@react-three/flex";
import { useSpring, animated } from "@react-spring/three";
import { Box3, Mesh, Vector3 } from "three";
import { text } from "stream/consumers";
import { useRef, useLayoutEffect } from "react";

const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial);

export default function GameOptions({ gameName }: { readonly gameName: string }) {
	const boxRef = useRef<Mesh>(null);
	const textRef = useRef<Mesh>(null);
	const size = new Vector3();
	const purple = useTexture("/textures/68049F_C90DE6_A404CF_B304DC.png");

	useLayoutEffect(() => {
		if (textRef.current && boxRef.current) {
			const box = new Box3().setFromObject(textRef.current);
			const boxSize = box.getSize(size);
			textRef.current.position.y -= boxSize.y / 2;
		}
	}, [textRef, boxRef]);

	return (
		<Box margin={0.1}>
			<RoundedBox ref={boxRef} args={[3.5, 1, 0.33]}>
				<meshBasicMaterial color="#00f" />
				{/* <meshBasicMaterial color="#2B2D31" /> */}
			</RoundedBox>
			<Text3D ref={textRef} font={"/fonts/gt.json"} size={1 / 5} position={[-1.7, 0, 0]} rotation={[0, 0, 0]}>
				#{gameName.replaceAll(" ", "-")}
				<meshBasicMaterial color="white" />
			</Text3D>
		</Box>
	);
}
