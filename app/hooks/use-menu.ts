import { useContext } from "react";
import { MenuContext } from "~/providers/menu-provider";

export function useMenu() {
	const menu = useContext(MenuContext);

	if (!menu) {
		throw new Error("useMenu must be used within a MenuProvider");
	}

	return menu;
}
