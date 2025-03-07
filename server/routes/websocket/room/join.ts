import { Socket } from "socket.io";

export default async function join(socket: Socket, room: string) {
	socket.join(room);
}
