import React, { useState, createContext, useMemo, useEffect } from "react";
import { useSocket } from "~/hooks/use-socket";

interface MenuContextProps {
	menu: string;
	setMenu: React.Dispatch<React.SetStateAction<string>>;
	subMenu: string;
	setSubMenu: React.Dispatch<React.SetStateAction<string>>;
	resetMenu: () => void;
	menuData: any;
	setMenuData: React.Dispatch<React.SetStateAction<any>>;
}

export const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export function MenuProvider({ children }: { readonly children: React.ReactNode }) {
	const [menu, setMenu] = useState("main");
	const [subMenu, setSubMenu] = useState("home");
	const [menuData, setMenuData] = useState<any>(null);
	const socket = useSocket();

	const resetMenu = () => {
		setMenu("main");
		setSubMenu("home");
		setMenuData(null);
		socket.emit("room/destroy");
	};

	const value = useMemo(
		() => ({
			menu,
			setMenu,
			subMenu,
			setSubMenu,
			resetMenu,
			menuData,
			setMenuData
		}),
		[menu, subMenu, menuData]
	);

	useEffect(() => {
		setSubMenu("home");
	}, [menu]);

	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
