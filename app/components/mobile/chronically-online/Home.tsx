import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { useMenu } from "~/hooks/use-menu";
import { useSocket } from "~/hooks/use-socket";
import { ScrollArea } from "~/components/shadcn/ui/scroll-area";

export default function Home() {
    const { setMenu } = useMenu();
    const [savedCode, setSavedCode] = useLocalStorage("code", "");
    const name = useReadLocalStorage<string>("name");
    const socket = useSocket();

    socket.on("room/destroyed", () => {
        setSavedCode("");
        setMenu("main");
    });

    return (
		<div className="fixed inset-0 size-full bg-[#1296E3] text-white">
			<nav className="flex justify-evenly items-center h-12.5 bg-[#F26419]">
				<h1 className="text-2xl font-black">{name}</h1>
			</nav>
			<ScrollArea className="size-full" id="main-menu-home-scroll-area"></ScrollArea>
		</div>
	);
}