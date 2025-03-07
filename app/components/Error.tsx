import { useMenu } from "~/hooks/use-menu";
import { Button } from "~/components/shadcn/ui/button";

export default function Error() {
	const { menu, subMenu, resetMenu } = useMenu();
	return (
		<div className="flex flex-col items-center justify-center h-full">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold text-red-500">Error</h1>
				<h3 className="text-xl text-red-500">Unknown Menu Reached</h3>
				<p className="text-white">Menu: {menu}</p>
				<p className="text-white">Sub Menu: {subMenu}</p>
				<Button className="mt-4" onClick={resetMenu}>
					Reset Menu State
				</Button>
			</div>
		</div>
	);
}
