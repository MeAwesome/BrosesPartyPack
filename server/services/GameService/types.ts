export type GameMeta = {
    id: string;
    name: string;
    tagline: string;
    description: string;
    players: string;
    audience: boolean;
    usesAI: boolean;
};

export type RoomCreateData = {
    gameID: string;
}

export type PlayerJoinData = {
    deviceID: string;
    roomCode: string;
    playerName: string;
};

export type PlayerCreateData = {
    deviceID: string;
    playerName: string;
    roomCode: string;
};

export type RoomSearchData = {
    roomCode: string;
}

export type ClientCreateData = {
    deviceID: string;
    client: string;
}

export type RoomSearchErrorData = {
    message: string;
}

export type RoomJoinErrorData = {
    message: string;
}

export type RoomCreatedData = {
    roomCode: string;
}

export type RoomJoinSuccessData = {
    socketID: string;
    playerName: string;
    roomCode: string;
    gameMeta: GameMeta;
    players: PlayerCreateData[];
}

export type RoomReconnectedData = {
    socketID: string;
    playerName: string;
    previousName: string;
    roomCode: string;
    gameMeta: GameMeta;
    players: PlayerCreateData[];
}

export type RoomSearchSuccessData = {
    roomCode: string;
    gameName: string;
}