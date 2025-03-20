import { FastifyReply, FastifyRequest } from "fastify";
import DiscordService from "@/services/DiscordService";

export default async function get(
	req: FastifyRequest<{
		Params: {
			channelID: string;
		};
	}>,
	res: FastifyReply
) {
	res.send(await DiscordService.getChannelMessages(req.params.channelID));
}
