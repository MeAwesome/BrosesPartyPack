/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import config from "@config";
import logger from "@logger";
import Service from "@/core/Service";

import {
	ActivityType,
	ApplicationCommand,
	ApplicationEmoji,
	ChannelType,
	Client,
	Collection,
	GatewayIntentBits,
	GuildEmoji,
	Message,
	PartialMessage,
	Partials,
	ReactionEmoji,
	REST,
	Routes,
	SlashCommandBuilder,
	TextChannel,
	User
} from "discord.js";

import ElasticSearchService from "@/services/ElasticSearchService";

export class DiscordService extends Service {
	private readonly client: Client;
	private readonly rest: REST;

	constructor() {
		super();

		this.client = new Client({
			intents: [
				GatewayIntentBits.GuildExpressions,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMessageReactions
			],
			partials: [Partials.Message, Partials.Channel, Partials.Reaction]
		});
		this.rest = new REST({ version: "10" }).setToken(config.services.project.discord.token);
	}

	public async start(): Promise<void> {
		if (process.env.NODE_ENV === "production") {
			await this.initSlashCommands();
			this.initClientEvents();
		}
		await this.client.login(config.services.project.discord.token);
		logger.info("Discord service started");
	}

	public async stop(): Promise<void> {
		await this.client.destroy();
		logger.info("Discord service stopped");
	}

	public getClient(): Client {
		return this.client;
	}

	public getRest(): REST {
		return this.rest;
	}

	public async getUserFromID(id: string): Promise<User> {
		return await this.client.users.fetch(id);
	}

	public async getAllTextChannels(): Promise<Collection<string, TextChannel>> {
		const guild = await this.client.guilds.fetch(config.services.project.discord.guildID);
		const channels = await guild.channels.fetch();
		return channels.filter((channel) => channel?.type === ChannelType.GuildText);
	}

	public async getMessageWithReactions(
		message: Message<boolean> | PartialMessage
	): Promise<MessageWithReactions<boolean> | null> {
		if (!message) {
			return null;
		}
		const reactions = new Collection<string, Reaction>();
		for (const reaction of message.reactions.cache.values()) {
			const reactionId = reaction.emoji.id ?? reaction.emoji.name;
			if (reactionId === null) {
				console.log("Reaction emoji is null: ", reaction);
				continue;
			}
			const usersReacted = (await reaction.users.fetch()).map((user) => user.id);
			reactions.set(reactionId, {
				me: reaction.me,
				meBurst: reaction.meBurst,
				users: usersReacted,
				emoji: reaction.emoji,
				burstColors: reaction.burstColors,
				count: reaction.count,
				countDetails: {
					burst: reaction.countDetails.burst,
					normal: reaction.countDetails.normal
				}
			});
		}
		return {
			...message,
			cleanContent: message.cleanContent,
			createdAt: message.createdAt,
			editedAt: message.editedAt,
			reactions,
			url: message.url
		} as MessageWithReactions<boolean>;
	}

	public async getChannelMessages(
		channelID: string,
		before?: string,
		limit?: number
	): Promise<Collection<string, MessageWithReactions<boolean>>> {
		const guild = await this.client.guilds.fetch(config.services.project.discord.guildID);
		const channel = await guild.channels.fetch(channelID);
		if (channel?.type !== ChannelType.GuildText) {
			throw new Error("Channel is not a text channel");
		}
		const messages = await channel.messages.fetch({ before, limit });
		const messagesWithReactions: Collection<string, MessageWithReactions<boolean>> = new Collection();
		for (const message of messages.values()) {
			const reactions = new Collection<string, Reaction>();
			for (const reaction of message.reactions.cache.values()) {
				const reactionId = reaction.emoji.id ?? reaction.emoji.name;
				if (reactionId === null) {
					console.log("Reaction emoji is null: ", reaction);
					continue;
				}
				const usersReacted = (await reaction.users.fetch()).map((user) => user.id);
				reactions.set(reactionId, {
					me: reaction.me,
					meBurst: reaction.meBurst,
					users: usersReacted,
					emoji: reaction.emoji,
					burstColors: reaction.burstColors,
					count: reaction.count,
					countDetails: {
						burst: reaction.countDetails.burst,
						normal: reaction.countDetails.normal
					}
				});
			}
			messagesWithReactions.set(message.id, {
				...message,
				cleanContent: message.cleanContent,
				createdAt: message.createdAt,
				editedAt: message.editedAt,
				reactions,
				url: message.url
			} as MessageWithReactions<boolean>);
		}
		return messagesWithReactions;
	}

	public async *getAllChannelMessages(channelID: string): AsyncGenerator<MessageWithReactions<boolean>, void, void> {
		let messages = await this.getChannelMessages(channelID);
		while (messages.size > 0) {
			for (const message of messages.values()) {
				yield message;
			}
			messages = await this.getChannelMessages(channelID, messages.last()?.id);
		}
	}

	public async *getAllChannelMessagesInBulk(
		channelID: string,
		limit: number
	): AsyncGenerator<Collection<string, MessageWithReactions<boolean>>, void, void> {
		let messages = await this.getChannelMessages(channelID, undefined, limit);
		while (messages.size > 0) {
			yield messages;
			messages = await this.getChannelMessages(channelID, messages.last()?.id, limit);
		}
	}

	public async initSlashCommands(): Promise<void> {
		const restCommands = [
			new SlashCommandBuilder().setName("fullsync").setDescription("Sync all messages to database"),
			new SlashCommandBuilder().setName("ranking").setDescription("Get your Broses ranking")
		];

		const entryCommand = (
			(await this.rest.get(
				Routes.applicationCommands(config.services.project.discord.clientID)
			)) as ApplicationCommand[]
		).find((command) => command.name === "launch");

		await this.rest.put(Routes.applicationCommands(config.services.project.discord.clientID), {
			body: [entryCommand, ...restCommands]
		});
		logger.info("Discord slash commands initialized");
	}

	public initClientEvents(): void {
		this.client.on("ready", () => {
			logger.info("Discord bot logged in");
			this.client.user?.setActivity("the Broses", {
				type: ActivityType.Listening
			});
		});
		this.client.on("messageCreate", (message) => {
			this.getMessageWithReactions(message)
				.then((messageWithReactions) => {
					if (messageWithReactions) {
						this.emit("messageCreate", messageWithReactions);
					}
				})
				.catch((error) => {
					logger.error("Error fetching message reactions: ", error);
				});
		});
		this.client.on("messageUpdate", (oldMessage, newMessage) => {
			this.getMessageWithReactions(newMessage)
				.then((messageWithReactions) => {
					if (messageWithReactions) {
						this.emit("messageUpdate", messageWithReactions);
					}
				})
				.catch((error) => {
					logger.error("Error fetching message reactions: ", error);
				});
		});
		this.client.on("messageDelete", (message) => {
			this.emit("messageDelete", message);
		});
		this.client.on("messageReactionAdd", (reaction) => {
			this.getMessageWithReactions(reaction.message)
				.then((messageWithReactions) => {
					if (messageWithReactions) {
						this.emit("messageUpdate", messageWithReactions);
					}
				})
				.catch((error) => {
					logger.error("Error fetching message reactions: ", error);
				});
		});
		this.client.on("messageReactionRemove", (reaction) => {
			this.getMessageWithReactions(reaction.message)
				.then((messageWithReactions) => {
					if (messageWithReactions) {
						this.emit("messageUpdate", messageWithReactions);
					}
				})
				.catch((error) => {
					logger.error("Error fetching message reactions: ", error);
				});
		});
		this.client.on("messageReactionRemoveAll", (message) => {
			this.getMessageWithReactions(message)
				.then((messageWithReactions) => {
					if (messageWithReactions) {
						this.emit("messageUpdate", messageWithReactions);
					}
				})
				.catch((error) => {
					logger.error("Error fetching message reactions: ", error);
				});
		});
		this.client.on("channelDelete", (channel) => {
			if (channel.type === ChannelType.GuildText) {
				this.emit("channelDelete", channel);
			}
		});
		this.client.on("channelPinsUpdate", (channel) => {
			if (channel.type !== ChannelType.GuildText) return;
			channel.messages
				.fetchPinned()
				.then((messages) => {
					messages.forEach((message) => {
						this.getMessageWithReactions(message)
							.then((messageWithReactions) => {
								if (messageWithReactions) {
									this.emit("messageUpdate", messageWithReactions);
								}
							})
							.catch((error) => {
								logger.error("Error fetching message reactions: ", error);
							});
					});
				})
				.catch((error) => {
					logger.error("Error fetching pinned messages: ", error);
				});
		});
		this.client.on("interactionCreate", async (interaction) => {
			if (!interaction.isChatInputCommand()) return;
			try {
				switch (interaction.commandName) {
					case "fullsync": {
						if (interaction.user.id !== config.services.project.discord.ownerID) {
							await interaction.reply("You do not have permission to do that.");
							return;
						}
						await interaction.reply("Syncing all messages to database...");
						await ElasticSearchService.syncDiscordToDatabase();
						const botChannel = (await this.client.channels.fetch(
							config.services.project.discord.botChannelID
						)) as TextChannel;
						await botChannel.send("Database in sync with Discord.");
						break;
					}
					case "ranking": {
						await interaction.reply("Calculating your ranking...");
						const totalMessages = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												term: {
													"author.bot": false
												}
											},
											{
												term: {
													"author.system": false
												}
											}
										]
									}
								},
								{
									authors: {
										terms: {
											field: "author.id.keyword",
											size: 1000
										}
									}
								},
								true,
								0
							)
						).aggregations?.authors?.buckets as {
							key: string;
							doc_count: number;
						}[];
						const totalEditedMessages = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												term: {
													"author.bot": false
												}
											},
											{
												term: {
													"author.system": false
												}
											},
											{
												exists: {
													field: "editedAt"
												}
											}
										]
									}
								},
								{
									authors: {
										terms: {
											field: "author.id.keyword",
											size: 1000
										}
									}
								},
								true,
								0
							)
						).aggregations?.authors?.buckets as {
							key: string;
							doc_count: number;
						}[];
						const totalKekwGiven = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												match: {
													"reactions.emoji.name": "kekw"
												}
											}
										]
									}
								},
								{
									reactors: {
										terms: {
											field: "reactions.users.keyword",
											size: 1000
										}
									}
								},
								true,
								0
							)
						).aggregations?.reactors?.buckets as {
							key: string;
							doc_count: number;
						}[];
						const totalKekwReceived = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												term: {
													"author.bot": false
												}
											},
											{
												term: {
													"author.system": false
												}
											},
											{
												match: {
													"reactions.emoji.name": "kekw"
												}
											}
										]
									}
								},
								{
									authors: {
										terms: {
											field: "author.id.keyword",
											size: 1000
										},
										aggs: {
											reactions: {
												sum: {
													field: "reactions.count"
												}
											}
										}
									}
								},
								true,
								0
							)
						).aggregations?.authors?.buckets as {
							key: string;
							doc_count: number;
							reactions: { value: number };
						}[];
						const totalTrueGiven = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												match: {
													"reactions.emoji.name": "true"
												}
											}
										]
									}
								},
								{
									reactors: {
										terms: {
											field: "reactions.users.keyword",
											size: 1000
										}
									}
								},
								true,
								0
							)
						).aggregations?.reactors?.buckets as {
							key: string;
							doc_count: number;
						}[];
						const totalTrueReceived = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												term: {
													"author.bot": false
												}
											},
											{
												term: {
													"author.system": false
												}
											},
											{
												match: {
													"reactions.emoji.name": "true"
												}
											}
										]
									}
								},
								{
									authors: {
										terms: {
											field: "author.id.keyword",
											size: 1000
										},
										aggs: {
											reactions: {
												sum: {
													field: "reactions.count"
												}
											}
										}
									}
								},
								true,
								0
							)
						).aggregations?.authors?.buckets as {
							key: string;
							doc_count: number;
							reactions: { value: number };
						}[];
						const totalYeahGiven = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												match: {
													"reactions.emoji.name": "yeah"
												}
											}
										]
									}
								},
								{
									reactors: {
										terms: {
											field: "reactions.users.keyword",
											size: 1000
										}
									}
								},
								true,
								0
							)
						).aggregations?.reactors?.buckets as {
							key: string;
							doc_count: number;
						}[];
						const totalYeahReceived = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												term: {
													"author.bot": false
												}
											},
											{
												term: {
													"author.system": false
												}
											},
											{
												match: {
													"reactions.emoji.name": "yeah"
												}
											}
										]
									}
								},
								{
									authors: {
										terms: {
											field: "author.id.keyword",
											size: 1000
										},
										aggs: {
											reactions: {
												sum: {
													field: "reactions.count"
												}
											}
										}
									}
								},
								true,
								0
							)
						).aggregations?.authors?.buckets as {
							key: string;
							doc_count: number;
							reactions: { value: number };
						}[];
						const totalWoefulGiven = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												match: {
													"reactions.emoji.name": "woeful"
												}
											}
										]
									}
								},
								{
									reactors: {
										terms: {
											field: "reactions.users.keyword",
											size: 1000
										}
									}
								},
								true,
								0
							)
						).aggregations?.reactors?.buckets as {
							key: string;
							doc_count: number;
						}[];
						const totalWoefulReceived = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												term: {
													"author.bot": false
												}
											},
											{
												term: {
													"author.system": false
												}
											},
											{
												match: {
													"reactions.emoji.name": "woeful"
												}
											}
										]
									}
								},
								{
									authors: {
										terms: {
											field: "author.id.keyword",
											size: 1000
										},
										aggs: {
											reactions: {
												sum: {
													field: "reactions.count"
												}
											}
										}
									}
								},
								true,
								0
							)
						).aggregations?.authors?.buckets as {
							key: string;
							doc_count: number;
							reactions: { value: number };
						}[];
						const totalHeartsGiven = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												match: {
													"reactions.emoji.name": "❤️"
												}
											}
										]
									}
								},
								{
									reactors: {
										terms: {
											field: "reactions.users.keyword",
											size: 1000
										}
									}
								},
								true,
								0
							)
						).aggregations?.reactors?.buckets as {
							key: string;
							doc_count: number;
						}[];
						const totalHeartsReceived = (
							await ElasticSearchService.search(
								{
									bool: {
										must: [
											{
												match: {
													guildId: config.services.project.discord.guildID
												}
											},
											{
												term: {
													"author.bot": false
												}
											},
											{
												term: {
													"author.system": false
												}
											},
											{
												match: {
													"reactions.emoji.name": "❤️"
												}
											}
										]
									}
								},
								{
									authors: {
										terms: {
											field: "author.id.keyword",
											size: 1000
										},
										aggs: {
											reactions: {
												sum: {
													field: "reactions.count"
												}
											}
										}
									}
								},
								true,
								0
							)
						).aggregations?.authors?.buckets as {
							key: string;
							doc_count: number;
							reactions: { value: number };
						}[];
						let userMessages = totalMessages.find((user) => user.key === interaction.user.id);
						let userEditedMessages = totalEditedMessages.find((user) => user.key === interaction.user.id);
						let userKekwGiven = totalKekwGiven.find((user) => user.key === interaction.user.id);
						let userKekwReceived = totalKekwReceived.find((user) => user.key === interaction.user.id);
						let userTrueGiven = totalTrueGiven.find((user) => user.key === interaction.user.id);
						let userTrueReceived = totalTrueReceived.find((user) => user.key === interaction.user.id);
						let userYeahGiven = totalYeahGiven.find((user) => user.key === interaction.user.id);
						let userYeahReceived = totalYeahReceived.find((user) => user.key === interaction.user.id);
						let userWoefulGiven = totalWoefulGiven.find((user) => user.key === interaction.user.id);
						let userWoefulReceived = totalWoefulReceived.find((user) => user.key === interaction.user.id);
						let userHeartsGiven = totalHeartsGiven.find((user) => user.key === interaction.user.id);
						let userHeartsReceived = totalHeartsReceived.find((user) => user.key === interaction.user.id);
						if (!userMessages) {
							userMessages = {
								key: interaction.user.id,
								doc_count: 0
							};
						}
						if (!userEditedMessages) {
							userEditedMessages = {
								key: interaction.user.id,
								doc_count: 0
							};
						}
						if (!userKekwGiven) {
							userKekwGiven = {
								key: interaction.user.id,
								doc_count: 0
							};
						}
						if (!userKekwReceived) {
							userKekwReceived = {
								key: interaction.user.id,
								doc_count: 0,
								reactions: {
									value: 0
								}
							};
						}
						if (!userTrueGiven) {
							userTrueGiven = {
								key: interaction.user.id,
								doc_count: 0
							};
						}
						if (!userTrueReceived) {
							userTrueReceived = {
								key: interaction.user.id,
								doc_count: 0,
								reactions: {
									value: 0
								}
							};
						}
						if (!userYeahGiven) {
							userYeahGiven = {
								key: interaction.user.id,
								doc_count: 0
							};
						}
						if (!userYeahReceived) {
							userYeahReceived = {
								key: interaction.user.id,
								doc_count: 0,
								reactions: {
									value: 0
								}
							};
						}
						if (!userWoefulGiven) {
							userWoefulGiven = {
								key: interaction.user.id,
								doc_count: 0
							};
						}
						if (!userWoefulReceived) {
							userWoefulReceived = {
								key: interaction.user.id,
								doc_count: 0,
								reactions: {
									value: 0
								}
							};
						}
						if (!userHeartsGiven) {
							userHeartsGiven = {
								key: interaction.user.id,
								doc_count: 0
							};
						}
						if (!userHeartsReceived) {
							userHeartsReceived = {
								key: interaction.user.id,
								doc_count: 0,
								reactions: {
									value: 0
								}
							};
						}
						let userMessageRank: number | string =
							totalMessages
								.sort((a, b) => b.doc_count - a.doc_count)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userEditedMessageRank: number | string =
							totalEditedMessages
								.sort((a, b) => b.doc_count - a.doc_count)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userKekwRankGiven: number | string =
							totalKekwGiven
								.sort((a, b) => b.doc_count - a.doc_count)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userKekwRankReceived: number | string =
							totalKekwReceived
								.sort((a, b) => b.reactions.value - a.reactions.value)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userTrueRankGiven: number | string =
							totalTrueGiven
								.sort((a, b) => b.doc_count - a.doc_count)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userTrueRankReceived: number | string =
							totalTrueReceived
								.sort((a, b) => b.reactions.value - a.reactions.value)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userYeahRankGiven: number | string =
							totalYeahGiven
								.sort((a, b) => b.doc_count - a.doc_count)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userYeahRankReceived: number | string =
							totalYeahReceived
								.sort((a, b) => b.reactions.value - a.reactions.value)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userWoefulRankGiven: number | string =
							totalWoefulGiven
								.sort((a, b) => b.doc_count - a.doc_count)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userWoefulRankReceived: number | string =
							totalWoefulReceived
								.sort((a, b) => b.reactions.value - a.reactions.value)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userHeartsRankGiven: number | string =
							totalHeartsGiven
								.sort((a, b) => b.doc_count - a.doc_count)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						let userHeartsRankReceived: number | string =
							totalHeartsReceived
								.sort((a, b) => b.reactions.value - a.reactions.value)
								.findIndex((user) => user.key === interaction.user.id) + 1;
						if (userMessageRank == 1) {
							userMessageRank = "🥇";
						} else if (userMessageRank == 2) {
							userMessageRank = "🥈";
						} else if (userMessageRank == 3) {
							userMessageRank = "🥉";
						}
						if (userEditedMessageRank == 1) {
							userEditedMessageRank = "🥇";
						} else if (userEditedMessageRank == 2) {
							userEditedMessageRank = "🥈";
						} else if (userEditedMessageRank == 3) {
							userEditedMessageRank = "🥉";
						}
						if (userKekwRankGiven == 1) {
							userKekwRankGiven = "🥇";
						} else if (userKekwRankGiven == 2) {
							userKekwRankGiven = "🥈";
						} else if (userKekwRankGiven == 3) {
							userKekwRankGiven = "🥉";
						}
						if (userKekwRankReceived == 1) {
							userKekwRankReceived = "🥇";
						} else if (userKekwRankReceived == 2) {
							userKekwRankReceived = "🥈";
						} else if (userKekwRankReceived == 3) {
							userKekwRankReceived = "🥉";
						}
						if (userTrueRankGiven == 1) {
							userTrueRankGiven = "🥇";
						} else if (userTrueRankGiven == 2) {
							userTrueRankGiven = "🥈";
						} else if (userTrueRankGiven == 3) {
							userTrueRankGiven = "🥉";
						}
						if (userTrueRankReceived == 1) {
							userTrueRankReceived = "🥇";
						} else if (userTrueRankReceived == 2) {
							userTrueRankReceived = "🥈";
						} else if (userTrueRankReceived == 3) {
							userTrueRankReceived = "🥉";
						}
						if (userYeahRankGiven == 1) {
							userYeahRankGiven = "🥇";
						} else if (userYeahRankGiven == 2) {
							userYeahRankGiven = "🥈";
						} else if (userYeahRankGiven == 3) {
							userYeahRankGiven = "🥉";
						}
						if (userYeahRankReceived == 1) {
							userYeahRankReceived = "🥇";
						} else if (userYeahRankReceived == 2) {
							userYeahRankReceived = "🥈";
						} else if (userYeahRankReceived == 3) {
							userYeahRankReceived = "🥉";
						}
						if (userWoefulRankGiven == 1) {
							userWoefulRankGiven = "🥇";
						} else if (userWoefulRankGiven == 2) {
							userWoefulRankGiven = "🥈";
						} else if (userWoefulRankGiven == 3) {
							userWoefulRankGiven = "🥉";
						}
						if (userWoefulRankReceived == 1) {
							userWoefulRankReceived = "🥇";
						} else if (userWoefulRankReceived == 2) {
							userWoefulRankReceived = "🥈";
						} else if (userWoefulRankReceived == 3) {
							userWoefulRankReceived = "🥉";
						}
						if (userHeartsRankGiven == 1) {
							userHeartsRankGiven = "🥇";
						} else if (userHeartsRankGiven == 2) {
							userHeartsRankGiven = "🥈";
						} else if (userHeartsRankGiven == 3) {
							userHeartsRankGiven = "🥉";
						}
						if (userHeartsRankReceived == 1) {
							userHeartsRankReceived = "🥇";
						} else if (userHeartsRankReceived == 2) {
							userHeartsRankReceived = "🥈";
						} else if (userHeartsRankReceived == 3) {
							userHeartsRankReceived = "🥉";
						}
						await interaction.editReply(
							`## **__Messages__**
### Sent: ${userMessages.doc_count
								.toString()
								.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${userMessageRank}/${totalMessages.length})
### Edited: ${userEditedMessages.doc_count
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userEditedMessageRank}/${totalEditedMessages.length})
## **__Reactions__**
### <:kekw:768121947119681608> Sent: ${userKekwGiven.doc_count
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userKekwRankGiven}/${totalKekwGiven.length})  |  Received: ${userKekwReceived.reactions.value
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userKekwRankReceived}/${totalKekwReceived.length})
### <:true:767603058392694784> Sent: ${userTrueGiven.doc_count
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userTrueRankGiven}/${totalTrueGiven.length})  |  Received: ${userTrueReceived.reactions.value
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userTrueRankReceived}/${totalTrueReceived.length})
### <:yeah:831501862498467850> Sent: ${userYeahGiven.doc_count
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userYeahRankGiven}/${totalYeahGiven.length})  |  Received: ${userYeahReceived.reactions.value
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userYeahRankReceived}/${totalYeahReceived.length})
### <:woeful:821898645317615666> Sent: ${userWoefulGiven.doc_count
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userWoefulRankGiven}/${totalWoefulGiven.length})  |  Received: ${userWoefulReceived.reactions.value
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userWoefulRankReceived}/${totalWoefulReceived.length})
### :heart: Sent: ${userHeartsGiven.doc_count
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userHeartsRankGiven}/${totalHeartsGiven.length})  |  Received: ${userHeartsReceived.reactions.value
								.toString()
								.replace(
									/\B(?=(\d{3})+(?!\d))/g,
									","
								)} (${userHeartsRankReceived}/${totalHeartsReceived.length})`
						);
						break;
					}
					default:
						await interaction.reply("Unknown command");
						break;
				}
			} catch (error) {
				logger.error("Error handling interaction: ", error);
				if (interaction.replied) {
					await interaction.followUp(
						"An error occurred while processing your command. Check the logs for more details."
					);
				} else {
					await interaction.reply(
						"An error occurred while processing your command. Check the logs for more details."
					);
				}
			}
		});
	}
}

export default new DiscordService();

export type Reaction = {
	me: boolean;
	meBurst: boolean;
	users: string[];
	emoji: GuildEmoji | ReactionEmoji | ApplicationEmoji;
	burstColors: string[] | null;
	count: number;
	countDetails: {
		burst: number;
		normal: number;
	};
};

export type MessageWithReactions<InGuild extends boolean = boolean> = Omit<
	Message<InGuild>,
	"cleanContent" | "createdAt" | "editedAt" | "reactions" | "url"
> & {
	cleanContent: string;
	createdAt: Date;
	editedAt: Date;
	reactions: Collection<string, Reaction>;
	url: string;
};
