import { ClientCreateData } from "@/services/GameService/types";
import { Socket } from "socket.io";

export default async function setClient(socket: Socket, data: ClientCreateData) {
	socket.join(data.client);
	socket.emit("setupClient");
}
