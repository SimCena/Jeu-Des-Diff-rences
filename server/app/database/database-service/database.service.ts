import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Game as GameSchema, GameDocument } from '@app/database/game-schema';
import { Game } from '@common/games';
import { Connection, Model } from 'mongoose';
import { TOP_SCORES } from '@app/constants/game';

@Injectable()
export class DatabaseService {
    constructor(@InjectModel(GameSchema.name) private gameModel: Model<GameDocument>, @InjectConnection() private connection: Connection) {}

    async getGames(): Promise<Game[]> {
        const games: Game[] = [];
        (await this.gameModel.find({})).forEach((schema) => {
            games.push(this.convertSchemaToGame(schema));
        });
        return games;
    }

    async addGame(game: Game): Promise<void> {
        try {
            await this.gameModel.create(this.convertGameToSchema(game));
        } catch (error) {
            return Promise.reject('Query Failed');
        }
    }

    async removeGame(id: number): Promise<void> {
        try {
            if ((await this.gameModel.deleteOne({ gameId: id })).deletedCount === 0) {
                return Promise.reject('Game Not Found');
            }
        } catch (error) {
            return Promise.reject('Query Failed');
        }
    }

    async removeAllGames(): Promise<void> {
        try {
            await this.gameModel.deleteMany({});
        } catch (error) {
            return Promise.reject('Query Failed');
        }
    }

    async updateGame(game: Game): Promise<void> {
        try {
            if ((await this.gameModel.updateOne({ gameId: game.id }, this.convertGameToSchema(game))).matchedCount === 0) {
                return Promise.reject('Game Not Found');
            }
        } catch (error) {
            return Promise.reject('Query Failed');
        }
    }

    async resetHighscores(): Promise<void> {
        try {
            await this.gameModel.updateMany({}, { solo: TOP_SCORES, multiplayer: TOP_SCORES });
        } catch (error) {
            return Promise.reject('Query Failed');
        }
    }

    private convertGameToSchema(game: Game): GameSchema {
        return {
            gameId: game.id,
            name: game.name,
            url: game.url,
            solo: game.solo,
            multiplayer: game.multiplayer,
            differenceImage: game.differenceImage,
            originalImage: game.originalImage,
            modifiedImage: game.modifiedImage,
        };
    }

    private convertSchemaToGame(schema: GameSchema): Game {
        return {
            id: schema.gameId,
            name: schema.name,
            url: schema.url,
            solo: schema.solo,
            multiplayer: schema.multiplayer,
            differenceImage: schema.differenceImage,
            originalImage: schema.originalImage,
            modifiedImage: schema.modifiedImage,
        };
    }
}
