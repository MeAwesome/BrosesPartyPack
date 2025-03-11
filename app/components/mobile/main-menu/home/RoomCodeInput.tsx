import { Input } from "~/components/shadcn/ui/input";

export default function RoomCodeInput({
	code,
	onCodeUpdate,
	gameName
}: {
	readonly code: string;
	readonly onCodeUpdate: (value: string) => void;
	readonly gameName: string;
}) {
	return (
		<div className="w-full">
			<div className="flex justify-between items-center mx-3">
				<p className="text-lg font-black">ROOM CODE</p>
				<p className="text-sm font-light text-gray-500 italic">{gameName}</p>
			</div>
			<Input
				placeholder="ENTER 4-LETTER CODE"
				value={code}
				onChange={(e) => {
					if (e.target.value.length > code.length && code.length >= 4) return;
					const regex = /^[A-Za-z]*$/;
					if (!regex.exec(e.target.value)) return;
					onCodeUpdate(e.target.value.toUpperCase().substring(0, 4));
				}}
				className="bg-[#1F2937] font-bold text-lg h-10"
			/>
		</div>
	);
}
