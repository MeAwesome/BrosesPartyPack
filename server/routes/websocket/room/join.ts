import { Socket } from "socket.io";

import GameService from "@/services/GameService";
import { PlayerJoinData } from "@/services/GameService/types";

export default async function join(socket: Socket, data: PlayerJoinData) {
	GameService.joinGame(socket, data);
}
