import { useRef, useState } from "react";
import { Separator } from "~/components/shadcn/ui/separator";
import MeAwesomeGamesLogo from "~/components/mobile/main-menu/home/MeAwesomeGamesLogo";

export default function PreviousGames() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = useRef<any>(null);
	const [loading, setLoading] = useState(false);

	if (!data.current && !loading) {
		setLoading(true);
		getPreviousGames().then((res) => {
			data.current = res;
			setLoading(false);
		});
	}

	if (data.current?.games) {
		return (
			<>
				<Separator className="mt-7 bg-[#353F4D]" />
				<div className="h-200 w-full bg-[#0D1C2B]">
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{data.current.games.map((game: any) => (
						<div key={game.gameID} className="text-white text-center">
							<p>{game.gameName}</p>
						</div>
					))}
				</div>
			</>
		);
	} else {
		return <MeAwesomeGamesLogo />;
	}
}

async function getPreviousGames() {
	const res = await fetch("/api/device/1/history");
	const json = await res.json();
	return json;
}
