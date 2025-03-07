import logger from "@logger";
import Service from "@/core/Service";
import Game from "@/services/GameService/Game";

import meta from "./meta.json" with { type: "json" };

export class GameService extends Service {
	private readonly games: Map<string, Game>;

	constructor() {
		super();
		this.games = new Map<string, Game>();
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
}

export default new GameService();
