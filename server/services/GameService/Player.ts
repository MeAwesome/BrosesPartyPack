import { PlayerCreateData } from "@/services/GameService/types";

export default class Player {

    public deviceID: string;
    public playerName: string;
    public roomCode: string;

    constructor(data: PlayerCreateData) {
        this.deviceID = data.deviceID;
        this.playerName = data.playerName;
        this.roomCode = data.roomCode;
    }

    public getDeviceID() {
        return this.deviceID;
    }

    public getPlayerName() {
        return this.playerName;
    }

    public getRoomCode() {
        return this.roomCode;
    }

    public setPlayerName(playerName: string) {
        this.playerName = playerName;
    }

}