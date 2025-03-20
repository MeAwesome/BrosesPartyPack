import { FastifyReply, FastifyRequest } from "fastify";
import DiscordService from "@/services/DiscordService";

export default async function get(req: FastifyRequest, res: FastifyReply) {
	res.send(await DiscordService.getAllTextChannels());
}
