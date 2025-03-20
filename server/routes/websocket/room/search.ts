import { Socket } from "socket.io";
import GameService from "@/services/GameService";
import { RoomSearchData } from "@/services/GameService/types";

export default async function search(socket: Socket, data: RoomSearchData) {
	const game = GameService.getGame(data.roomCode);
	if (game) {
		const meta = game.getMeta();
		socket.emit("room/search/success", {
			roomCode: data.roomCode,
			gameName: meta.name
		});
	} else {
		socket.emit("room/search/error", {
			message: "Room not found"
		});
	}
}
