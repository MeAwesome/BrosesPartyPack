import React, { useState, createContext, useMemo, useEffect } from "react";

interface MenuContextProps {
	menu: string;
	setMenu: React.Dispatch<React.SetStateAction<string>>;
	subMenu: string;
	setSubMenu: React.Dispatch<React.SetStateAction<string>>;
	resetMenu: () => void;
}

export const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export function MenuProvider({ children }: { readonly children: React.ReactNode }) {
	const [menu, setMenu] = useState("main");
	const [subMenu, setSubMenu] = useState("home");

	const resetMenu = () => {
		setMenu("main");
		setSubMenu("home");
	};

	const value = useMemo(
		() => ({
			menu,
			setMenu,
			subMenu,
			setSubMenu,
			resetMenu
		}),
		[menu, subMenu]
	);

	useEffect(() => {
		setSubMenu("home");
	}, [menu]);

	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
