import GameService from "@/services/GameService";
import WebSocketService from "@/core/services/WebSocketService";
import TimingsService from "@/core/services/TimingsService";
import { Socket } from "socket.io";
import { RoomCreateData, GameMeta, PlayerJoinData } from "@/services/GameService/types";
import Player from "@/services/GameService/Player";

export default class Game {
	protected gameID: string;
	protected code: string;
	protected meta: GameMeta;
	protected players: Map<string, Player>;
	protected allowNewPlayers: boolean;
	protected started: boolean;

	constructor(data: RoomCreateData) {
		this.gameID = data.gameID;
		this.code = GameService.generateCode();
		this.meta = GameService.getMetaForGame(data.gameID);
		this.players = new Map<string, Player>();
		this.allowNewPlayers = true;
		this.started = false;
	}

	public getCode(): string {
		return this.code;
	}

	public getMeta(): GameMeta {
		return this.meta;
	}

	public join(socket: Socket, data: PlayerJoinData): void {
		socket.join(this.code);
		const existingPlayer = this.players.get(data.deviceID);
		if (existingPlayer) {
			const previousName = existingPlayer.getPlayerName();
			existingPlayer.setPlayerName(data.playerName);
			this.emit("room/reconnect/success", {
				socketID: socket.id,
				playerName: data.playerName,
				previousName: previousName,
				roomCode: this.code,
				gameMeta: this.meta,
				players: Array.from(this.players.values()),
				playerData: existingPlayer
			});
		} else if (this.allowNewPlayers) {
			const player = new Player({
				deviceID: data.deviceID,
				playerName: data.playerName,
				roomCode: this.code,
				isHost: this.players.size === 0,
				screen: "home"
			});
			this.players.set(data.deviceID, player);
			this.emit("room/join/success", {
				socketID: socket.id,
				playerName: data.playerName,
				roomCode: this.code,
				gameMeta: this.meta,
				players: Array.from(this.players.values()),
				playerData: player
			});
		} else {
			this.emit("room/join/error", {
				message: "Game is full or not accepting new players."
			});
		}
	}

	public async ready(): Promise<void> {
		if (this.started) return;
		this.allowNewPlayers = false;
		for (let i = 3; i > 0; i--) {
			if (this.allowNewPlayers) return;
			this.emit("game/countdown", {
				countdown: i
			});
			await TimingsService.sleep(1000, `${this.code}-countdown`);
		}
		if (this.allowNewPlayers) return;
		this.started = true;
		this.setPlayerScreens("blank");
		this.emit("game/start");
	}

	public async unready(): Promise<void> {
		if (this.started) return;
		this.allowNewPlayers = true;
		TimingsService.clearTiming(`${this.code}-countdown`);
		this.emit("game/unready");
	}

	public setPlayerScreens(screen: string): void {
		this.players.forEach((player) => {
			player.setScreen(screen);
		});
	}

	public emit(event: string, data?: any): void {
		WebSocketService.getServer().to(this.code).emit(event, data);
	}
}
