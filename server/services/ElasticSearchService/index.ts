import config from "@config";
import logger from "@logger";
import Service from "@/core/Service";

import DiscordService, { MessageWithReactions } from "@/services/DiscordService";
import { Client, estypes } from "@elastic/elasticsearch";
import { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

export class ElasticSearchService extends Service {
	private client!: Client;

	constructor() {
		super();
	}

	public async start(): Promise<void> {
		await DiscordService.waitForActivation();
		this.client = new Client({
			node: config.services.project.elasticsearch.url,
			auth: {
				apiKey: config.services.project.elasticsearch.apiKey
			}
		});
		DiscordService.on("messageCreate", async (message: MessageWithReactions<boolean>) => {
			await this.indexDiscordMessage(message);
		});
		DiscordService.on("messageUpdate", async (message: MessageWithReactions<boolean>) => {
			await this.indexDiscordMessage(message);
		});
		DiscordService.on(
			"messageDelete",
			async (message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>) => {
				await this.deleteDiscordMessage(message);
			}
		);
		DiscordService.on("channelDelete", async (channel) => {
			await this.client.deleteByQuery({
				index: config.services.project.elasticsearch.index,
				query: {
					bool: {
						must: [
							{
								match: {
									guildId: channel.guildId
								}
							},
							{
								match: {
									channelId: channel.id
								}
							}
						]
					}
				}
			});
		});
		logger.info("Elasticsearch service started");
	}

	public async stop(): Promise<void> {
		await this.client.close();
		logger.info("Elasticsearch service stopped");
	}

	public getClient(): Client {
		return this.client;
	}

	public async syncDiscordToDatabase(): Promise<void> {
		const textChannels = await DiscordService.getAllTextChannels();
		const promises: Promise<void>[] = [];
		let finished = 0;
		for (const [, channel] of textChannels) {
			promises.push(
				new Promise((resolve) => {
					(async () => {
						let totalMessages = 0;
						logger.info(`Indexing messages for channel ${channel.name}`);
						for await (const messages of DiscordService.getAllChannelMessagesInBulk(channel.id, 100)) {
							await this.bulkIndexDiscordMessages(Array.from(messages.values()));
							totalMessages += messages.size;
						}
						logger.info(
							`Indexed ${totalMessages} messages for channel ${channel.name} [${++finished}/${textChannels.size}]`
						);
						resolve();
					})();
				})
			);
		}
		await Promise.all(promises);
		logger.info("Finished indexing Discord messages");
	}

	public async bulkIndexDiscordMessages(data: MessageWithReactions<boolean>[]): Promise<any> {
		return await this.client.helpers.bulk({
			datasource: data,
			onDocument: (doc: MessageWithReactions<boolean>) => ({
				index: {
					_index: config.services.project.elasticsearch.index,
					_id: `${doc.guildId}-${doc.channelId}-${doc.id}`
				}
			})
		});
	}

	public async indexDiscordMessage(data: MessageWithReactions<boolean>): Promise<any> {
		return await this.client.helpers.bulk({
			datasource: [data],
			onDocument: (doc: MessageWithReactions<boolean>) => ({
				index: {
					_index: config.services.project.elasticsearch.index,
					_id: `${doc.guildId}-${doc.channelId}-${doc.id}`
				}
			})
		});
	}

	public async deleteDiscordMessage(
		data: MessageWithReactions<boolean> | OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>
	): Promise<any> {
		return await this.client.delete({
			index: config.services.project.elasticsearch.index,
			id: `${data.guildId}-${data.channelId}-${data.id}`
		});
	}

	public async search(
		query: estypes.QueryDslQueryContainer,
		aggregations?: Record<string, estypes.AggregationsAggregationContainer>,
		track_total_hits?: boolean,
		size?: number
	): Promise<estypes.SearchResponse<unknown, Record<string, estypes.AggregationsAggregate>>> {
		return this.client.search({
			index: config.services.project.elasticsearch.index,
			query,
			aggregations,
			track_total_hits,
			size
		});
	}

	public async count(query: estypes.QueryDslQueryContainer): Promise<estypes.CountResponse> {
		return this.client.count({
			index: config.services.project.elasticsearch.index,
			query
		});
	}
}

export default new ElasticSearchService();
