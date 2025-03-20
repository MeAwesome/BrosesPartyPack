import { FastifyReply, FastifyRequest } from "fastify";
import ElasticSearchService from "@/services/ElasticSearchService";

export default async function get(req: FastifyRequest, res: FastifyReply) {
	res.send(
		await ElasticSearchService.search({
			match: {
				content: "kekw"
			}
		})
	);
}
