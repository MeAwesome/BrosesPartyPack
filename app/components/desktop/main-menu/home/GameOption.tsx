import { Center, RoundedBox, Text3D, Sphere } from "@react-three/drei";
import { Box } from "@react-three/flex";
import { Box3, Mesh, Vector3 } from "three";
import { useRef, useLayoutEffect } from "react";

export default function GameOption({ gameName, selected, loaderData }: { readonly gameName: string; readonly selected: boolean, readonly loaderData: any }) {
	const boxRef = useRef<Mesh>(null);
	const textRef = useRef<Mesh>(null);
	const size = new Vector3();

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
				<meshBasicMaterial color={selected ? "#404249" : "#2B2D31"} />
			</RoundedBox>
			<Text3D ref={textRef} font={loaderData.fonts.herticalsans} size={1 / 5} position={[-1.7, 0, 0]} rotation={[0, 0, 0]}>
				#{gameName.replaceAll(" ", "-")}
				<meshBasicMaterial color={selected ? "#FFFFFF" : "#949BA4"} />
			</Text3D>
			{selected && (
				<group>
					<Sphere args={[0.4, 16, 16]} position={[1.3, 0, 0]}>
						<meshBasicMaterial color="#F23F43" />
					</Sphere>
					<Center front position={[1.3, 0, 0.2]}>
						<Text3D font={loaderData.fonts.herticalsans} size={1 / 5} position={[1.3, 0, 0.2]} rotation={[0, 0, 0]}>
							1
						</Text3D>
					</Center>
				</group>
			)}
		</Box>
	);
}
