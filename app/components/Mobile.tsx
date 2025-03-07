import { useMenu } from "~/hooks/use-menu";
import MainMenu from "~/components/mobile/MainMenu";
import Error from "~/components/Error";

export default function Mobile() {
	const { menu } = useMenu();

	switch (menu) {
		case "main":
			return <MainMenu />;
		default:
			return <Error />;
	}
}
