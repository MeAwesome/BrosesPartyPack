import logger from "@logger";
import Service from "@/core/Service";
import Game from "@/services/GameService/Game";
import ShortUniqueId from "short-unique-id";

import meta from "./meta.json" with { type: "json" };

import ChronicallyOnline from "@/services/GameService/ChronicallyOnline";
import { Socket } from "socket.io";
import { GameMeta, PlayerJoinData, RoomCreateData } from "@/services/GameService/types";
import WebSocketService from "@/core/services/WebSocketService";

export class GameService extends Service {

	private readonly games: Map<string, Game>;
	private readonly uid: ShortUniqueId;

	constructor() {
		super();
		this.games = new Map<string, Game>();
		this.uid = new ShortUniqueId({ length: 4, dictionary: "alpha_upper" });
	}

	public async start(): Promise<void> {
		logger.info("Game service started");
	}

	public async stop(): Promise<void> {
		logger.info("Game service stopped");
	}

	public getGame(roomCode: string): Game | undefined {
		return this.games.get(roomCode);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getMeta(): any {
		return meta;
	}

	public createGame(socket: Socket, data: RoomCreateData): void {
		let game: Game;
		let code: string;
		switch (data.gameID) {
			case "chronicallyonline":
				game = new ChronicallyOnline();
				code = game.getCode();
				break;
			default:
				return;
		}
		this.games.set(code, game);
		socket.join(code);
		socket.emit("room/created", {
			roomCode: code
		});
	}

	public joinGame(socket: Socket, data: PlayerJoinData): void {
		const game = this.games.get(data.roomCode);
		if (game) {
			game.join(socket, data);
		} else {
			socket.emit("room/join/error", {
				message: "Room not found"
			});
		}
	}

	public destroyGame(roomCode: string): void {
		const game = this.games.get(roomCode);
		if (game) {
			WebSocketService.getServer().to(roomCode).emit("room/destroyed");
		}
		this.games.delete(roomCode);
	}

	public destroyGameBySocket(socket: Socket): void {
		const roomCode = this.getRoomCodeBySocket(socket);
		if (roomCode) {
			this.destroyGame(roomCode);
		}
	}

	public getRoomCodeBySocket(socket: Socket): string | undefined {
		const rooms = Array.from(socket.rooms);
		const roomCode = rooms.find((room) => this.games.has(room));
		return roomCode;
	}

	public generateCode(): string {
		const code = this.uid.randomUUID();
		if (this.games.has(code)) {
			return this.generateCode();
		}
		return code;
	}

	public getMetaForGame(gameID: string): GameMeta {
		const gameMeta = meta.find((game) => game.id == gameID);
		if (gameMeta) {
			return gameMeta;
		}
		throw new Error("No meta found: " + gameID);
	}

}

export default new GameService();
