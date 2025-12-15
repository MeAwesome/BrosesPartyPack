import { useMenu } from "~/hooks/use-menu";
import Home from "~/components/desktop/chronically-online/Home";
import Instructions from "~/components/desktop/chronically-online/Instructions";
import Error from "~/components/Error";

export default function ChronicallyOnline({ loaderData }: { readonly loaderData: any }) {
	const { subMenu } = useMenu();

	switch (subMenu) {
		case "home":
			return <Home loaderData={loaderData} />;
		case "instructions":
			return <Instructions loaderData={loaderData} />;
		default:
			return <Error />;
	}
}
