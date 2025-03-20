import { Socket } from "socket.io";
import GameService from "@/services/GameService";

export default async function destroy(socket: Socket) {
	GameService.destroyGameBySocket(socket);
}
