import React, { useState, createContext, useMemo } from "react";

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

	const resetMenu = () => {
		setMenu("main");
		setSubMenu("home");
		setMenuData(null);
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

	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
