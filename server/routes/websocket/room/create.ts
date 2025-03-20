import { Socket } from "socket.io";
import GameService from "@/services/GameService";
import { RoomCreateData } from "@/services/GameService/types";

export default async function create(socket: Socket, data: RoomCreateData) {
	GameService.createGame(socket, data);
}
