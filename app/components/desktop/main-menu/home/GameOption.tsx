import { Center, RoundedBox, Text3D, useTexture, MeshDistortMaterial, Sphere, Outlines } from "@react-three/drei";
import { Box } from "@react-three/flex";
import { useSpring, animated } from "@react-spring/three";

const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial);

export default function GameOptions({
    gameName
}: {
    readonly gameName: string;
}) {
	const purple = useTexture("/textures/68049F_C90DE6_A404CF_B304DC.png");

	return (
		<Box margin={0.1}>
			<RoundedBox args={[3, 1, 0.33]}>
				<meshMatcapMaterial color="white" matcap={purple} />
			</RoundedBox>
            {/* <Sphere args={[1, 32, 32]}>
                <AnimatedMeshDistortMaterial
                    color={"#0FF"}
                    distort={0.5}
                    speed={5}
                />
            </Sphere> */}
			{/* <Center>
				<Text3D
                    font={"/fonts/gt.json"}
                    size={1}
                >
					{gameName}
					<meshMatcapMaterial color="white" matcap={purple} />
				</Text3D>
			</Center> */}
		</Box>
	);
}
