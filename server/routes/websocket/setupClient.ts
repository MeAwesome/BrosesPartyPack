import { Socket } from "socket.io";

export default async function setClient(socket: Socket, deviceID: string, client: string) {
	socket.join(client);
	socket.emit("setupClient");
}
