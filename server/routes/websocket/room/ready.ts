import { Socket } from "socket.io";
import GameService from "@/services/GameService";

export default async function ready(socket: Socket) {
	GameService.setRoomReadyBySocket(socket);
}
