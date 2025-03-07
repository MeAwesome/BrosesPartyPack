import { Input } from "~/components/shadcn/ui/input";

export default function NameInput({
	name,
	onNameUpdate,
	charsLeft
}: {
	readonly name: string;
	readonly onNameUpdate: (value: string) => void;
	readonly charsLeft: number;
}) {
	return (
		<div className="w-full">
			<div className="flex justify-between items-center mx-3">
				<p className="text-lg font-black">NAME</p>
				<p className="text-lg font-black">{charsLeft}</p>
			</div>
			<Input
				placeholder="ENTER YOUR NAME"
				value={name}
				onChange={(e) => {
					if (e.target.value.length > name.length && charsLeft <= 0) return;
					const regex = /^[\x20-\x7F]*$/;
					if (!regex.exec(e.target.value)) return;
					onNameUpdate(e.target.value.toUpperCase().trimStart());
				}}
				className="bg-[#1F2937] font-bold text-lg h-10"
			/>
		</div>
	);
}
