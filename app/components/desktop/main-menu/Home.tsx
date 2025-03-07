import { useLoaderData } from "@remix-run/react";
import { type loader } from "~/routes/_index";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Center, RoundedBox, Text3D, useMatcapTexture, useTexture } from "@react-three/drei";
import { Flex, Box } from "@react-three/flex";
import GameOption from "~/components/desktop/main-menu/home/GameOption";
import { NoToneMapping } from "three";

export default function Home() {
	const { meta } = useLoaderData<typeof loader>();

	return (
		<div
			className="bg-cover size-full bg-[#313338]"
			// style={{
			// 	backgroundImage: "url('/images/sky.jpg')"
			// }}
		>
			<Canvas
				onCreated={({ gl }) => {
					gl.toneMapping = NoToneMapping;
				}}
			>
				<ambientLight />
				<Flex justifyContent="center" alignItems="flex-start" position={[-4, 0, 0]} rotation={[0, 0.4, 0]}>
						{meta.map((game) => (
							<GameOption key={game.id} gameName={game.name} />
						))}
					</Flex>
				{/* <Text3D font={"/fonts/gt.json"}>Hello</Text3D> */}
				{/* <GameOption /> */}
				<CameraControls />
			</Canvas>
		</div>
	);
}
