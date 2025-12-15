import { Socket } from "socket.io";
import GameService from "@/services/GameService";

export default async function unready(socket: Socket) {
	GameService.setRoomUnreadyBySocket(socket);
}
