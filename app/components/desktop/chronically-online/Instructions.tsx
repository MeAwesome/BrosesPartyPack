import { CameraControls, Sphere } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { useMenu } from "~/hooks/use-menu";
import { useSocket } from "~/hooks/use-socket";

export default function Instructions({ loaderData }: { readonly loaderData: any }) {
	const { resetMenu } = useMenu();
	const socket = useSocket();
	const cameraRef = useRef<CameraControls>(null);
	const camera = useThree((state) => state.camera);

	socket.on("room/destroy/success", () => {
		resetMenu();
	});

	useEffect(() => {
		cameraRef.current?.moveTo(0, 0, 0, false);
		cameraRef.current?.rotateTo(0, Math.PI / 2, false);
	});

	return (
		<>
			<Background />
			<Sphere args={[10, 32, 32]} position={[0, 0, 0]} />
			<CameraControls camera={camera} ref={cameraRef} />
		</>
	);
}

function Background() {
	const { scene } = useThree();
	scene.background = new Color("#222222");
	return null;
}
