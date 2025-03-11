import GameService from "@/services/GameService";
import WebSocketService from "@/core/services/WebSocketService";
import { Socket } from "socket.io";
import { RoomCreateData, GameMeta, PlayerJoinData } from "@/services/GameService/types";
import Player from "@/services/GameService/Player";

export default class Game {

    protected gameID: string;
    protected code: string;
    protected meta: GameMeta;
    protected players: Map<string, Player>;

    constructor(data: RoomCreateData) {
        this.gameID = data.gameID;
        this.code = GameService.generateCode();
        this.meta = GameService.getMetaForGame(data.gameID);
        this.players = new Map<string, Player>();
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
            WebSocketService.getServer().to(this.code).emit("room/reconnected", {
                socketID: socket.id,
                playerName: data.playerName,
                previousName: previousName,
                roomCode: this.code,
                gameMeta: this.meta,
                players: Array.from(this.players.values())
            });
        } else {
            const player = new Player({
                deviceID: data.deviceID,
                playerName: data.playerName,
                roomCode: this.code
            });
            this.players.set(data.deviceID, player);
            WebSocketService.getServer().to(this.code).emit("room/join/success", {
                socketID: socket.id,
                playerName: data.playerName,
                roomCode: this.code,
                gameMeta: this.meta,
                players: Array.from(this.players.values())
            });
        }
    }

}
