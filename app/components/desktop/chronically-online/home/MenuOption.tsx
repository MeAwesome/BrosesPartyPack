import { Center, RoundedBox, Text3D } from "@react-three/drei";
import { Box } from "@react-three/flex";
import { Mesh } from "three";
import { useRef } from "react";

export default function MenuOption({
	option,
	selected,
	loaderData
}: {
	readonly option: string;
	readonly selected: boolean;
	readonly loaderData: any;
}) {
	const boxRef = useRef<Mesh>(null);
	const textRef = useRef<Mesh>(null);

	return (
		<Box margin={0.1}>
			<RoundedBox ref={boxRef} args={[selected ? 5 : 3.5, 1, 0.33]}>
				<meshBasicMaterial color={selected ? "#F6AE2D" : "#2F4858"} />
			</RoundedBox>
			<Center front position={[0, 0, 0.17]}>
				<Text3D
					ref={textRef}
					font={loaderData.fonts.monoton}
					size={1 / 4}
					position={[-1.7, 0, 0]}
					rotation={[0, 0, 0]}
					height={0.01}
				>
					{option}
					<meshBasicMaterial color={selected ? "#1296e3" : "#F26419"} />
				</Text3D>
			</Center>
		</Box>
	);
}
