import { useLoaderData } from "@remix-run/react";
import { type loader } from "~/routes/_index";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Center, RoundedBox, Text3D, useMatcapTexture, useTexture } from "@react-three/drei";
import { Flex, Box } from "@react-three/flex";
import GameOption from "~/components/desktop/main-menu/home/GameOption";

export default function Home() {
	const { meta } = useLoaderData<typeof loader>();

	return (
		<div
			className="bg-cover size-full"
			style={{
				backgroundImage: "url('/images/sky.jpg')"
			}}
		>
			<Canvas>
				<ambientLight />
				<Flex justifyContent="center" alignItems="flex-start" position={[-4, 0, 0]} rotation={[0, 0.4, 0]}>
						{meta.map((game) => (
							<GameOption key={game.id} gameName={game.name} />
						))}
					{/* <Box>
						<RoundedBox args={[1, 1, 1]} />
					</Box>
					<Box>
						<RoundedBox args={[1, 1, 1]} />
					</Box> */}
				</Flex>
				{/* <Text3D font={"/fonts/gt.json"}>Hello</Text3D> */}
				{/* <GameOption /> */}
				<CameraControls />
			</Canvas>
		</div>
	);
}
