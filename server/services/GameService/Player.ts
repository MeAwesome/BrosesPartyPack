import { PlayerCreateData } from "@/services/GameService/types";

export default class Player {
	protected deviceID: string;
	protected playerName: string;
	protected roomCode: string;
	protected isHost: boolean;

	constructor(data: PlayerCreateData) {
		this.deviceID = data.deviceID;
		this.playerName = data.playerName;
		this.roomCode = data.roomCode;
		this.isHost = data.isHost;
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
