import { useMenu } from "~/hooks/use-menu";
import Home from "~/components/desktop/chronically-online/Home";
import Error from "~/components/Error";

export default function MainMenu({ loaderData }: { readonly loaderData: any }) {
	const { subMenu } = useMenu();

	switch (subMenu) {
		case "home":
			return <Home loaderData={loaderData} />;
		default:
			return <Error />;
	}
}
