import { animated, SpringValue } from "@react-spring/three";
import { Plane } from "@react-three/drei";

export default function Background({ color }: { readonly color: SpringValue<string> }) {
	return (
        <>
		<Plane args={[100, 100]} position={[0, 0, -30]}>
            <animated.meshBasicMaterial
                color={color}
                opacity={1}
            />
        </Plane>
		<Plane args={[100, 100]} position={[-50, 0, 20]} rotation={[0, Math.PI / 2, 0]}>
            <animated.meshBasicMaterial
                color={color}
                opacity={1}
            />
        </Plane>
        </>
	);
}
