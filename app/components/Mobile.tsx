import { useMenu } from "~/hooks/use-menu";
import MainMenu from "~/components/mobile/MainMenu";
import Error from "~/components/Error";
import ChronicallyOnline from "~/components/mobile/ChronicallyOnline";

export default function Mobile() {
	const { menu } = useMenu();

	switch (menu) {
		case "main":
			return <MainMenu />;
		case "chronicallyonline":
			return <ChronicallyOnline />;
		default:
			return <Error />;
	}
}
