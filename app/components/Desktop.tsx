import { useMenu } from "~/hooks/use-menu";
import MainMenu from "~/components/desktop/MainMenu";
import Error from "~/components/Error";
import { useDebounceCallback, useEventListener } from "usehooks-ts";
import { Canvas } from "@react-three/fiber";
import { NoToneMapping } from "three";
import ChronicallyOnline from "~/components/desktop/ChronicallyOnline";
import { useSocket } from "~/hooks/use-socket";

export default function Desktop({ loaderData }: { readonly loaderData: any }) {
	const { menu } = useMenu();
	const socket = useSocket();

	const debounced = useDebounceCallback(() => {
		document.getElementById("gameContent")?.classList.add("hide-mouse");
	}, 3000);

	useEventListener("mousemove", () => {
		document.getElementById("gameContent")?.classList.remove("hide-mouse");
		debounced();
	});

	// @ts-expect-error testing
	useEventListener("visibilitychange", () => {
		socket.emit("room/destroy");
	});

	let content;
	switch (menu) {
		case "main":
			content = <MainMenu loaderData={loaderData} />;
			break;
		case "chronicallyonline":
			content = <ChronicallyOnline loaderData={loaderData} />;
			break;
		default:
			return <Error />;
	}

	return (
		<div className="fixed inset-0 size-full">
			<div className="flex items-center justify-center size-full">
				<div id="gameContent" className="grow-0 aspect-video size-full-16/9 min-w-0">
					<div className="size-full">
						<Canvas
							onCreated={({ gl }) => {
								gl.toneMapping = NoToneMapping;
							}}
						>
							<ambientLight />
							{content}
						</Canvas>
					</div>
				</div>
			</div>
		</div>
	);
}
