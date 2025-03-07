import { useMenu } from "~/hooks/use-menu";
import MainMenu from "~/components/desktop/MainMenu";
import Error from "~/components/Error";
import { useEventListener } from "usehooks-ts";
import { useEffect, useRef, useState } from "react";

export default function Desktop() {
	const { menu } = useMenu();

	let content;
	switch (menu) {
		case "main":
			content = <MainMenu />;
			break;
		default:
			content = <Error />;
			break;
	}

	return (
		<div className="fixed inset-0 size-full">
			<div className="flex items-center justify-center size-full">
				<div id="gameContent" className="grow-0 aspect-video size-full-16/9 min-w-0">
					{content}
				</div>
			</div>
		</div>
	);
}