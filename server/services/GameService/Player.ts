import { PlayerCreateData } from "@/services/GameService/types";

export default class Player {
	protected deviceID: string;
	protected playerName: string;
	protected roomCode: string;
	protected isHost: boolean;
	protected screen: string;

	constructor(data: PlayerCreateData) {
		this.deviceID = data.deviceID;
		this.playerName = data.playerName;
		this.roomCode = data.roomCode;
		this.isHost = data.isHost;
		this.screen = data.screen;
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

	public isPlayerHost() {
		return this.isHost;
	}

	public getScreen() {
		return this.screen;
	}

	public setScreen(screen: string) {
		this.screen = screen;
	}
}
