import { useMenu } from "~/hooks/use-menu";
import Home from "~/components/mobile/chronically-online/Home";
import Error from "~/components/Error";

export default function MainMenu() {
	const { subMenu } = useMenu();

	switch (subMenu) {
		case "home":
			return <Home />;
		default:
			return <Error />;
	}
}
