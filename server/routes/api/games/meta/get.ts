import { FastifyReply, FastifyRequest } from "fastify";
import GameService from "@/services/GameService";

export default async function get(req: FastifyRequest, res: FastifyReply) {
	res.send(GameService.getMeta());
}
