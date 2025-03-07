import { FastifyReply, FastifyRequest } from "fastify";

export default async function get(
	req: FastifyRequest<{
		Params: {
			deviceID: string;
		};
	}>,
	res: FastifyReply
) {
	return {};
	return res.send({
		totalGames: 1,
		games: [
			{
				gameID: "balls-lmao",
				gameName: "Balls-Lmao Balls-Lmao",
				gameType: "gameType",
				gameStatus: "gameStatus",
				gameStarted: new Date(),
				gameEnded: new Date(),
				gamePlayers: [
					{
						playerID: "playerID",
						playerName: "playerName",
						playerScore: 0,
						playerStatus: "playerStatus"
					}
				]
			}
		]
	});
}
