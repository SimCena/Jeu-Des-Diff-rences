import { TOP_SCORES } from '@app/constants/game';
import { DatabaseService } from '@app/database/database-service/database.service';
import { MAX_UINT8 } from '@common/constants/detection';
import { BYTES_PER_RGBA_VALUE, IMAGE_HEIGHT, IMAGE_WIDTH } from '@common/constants/image';
import { GameDataNumbered } from '@common/game-data';
import { GameRoom } from '@common/game-room';
import { Difference, Game, GameClient } from '@common/games';
import { RoomId } from '@common/room-id';
import { Injectable } from '@nestjs/common';
import * as bmp from 'bmp-js';
import fs from 'fs';

@Injectable()
export class GameService {
    private games: Game[];
    private tempDeletedGames: Game[];

    constructor(private databaseService: DatabaseService) {
        this.tempDeletedGames = [];
        this.readGames();
    }

    getImageData(path: string): number[] {
        const data = [...bmp.decode(fs.readFileSync(path)).data];
        return this.fixAlphaData(data);
    }

    getGames(): Game[] {
        return this.games;
    }

    getClientGames(): GameClient[] {
        const gamesClient: GameClient[] = [];
        this.games.forEach((game) => {
            gamesClient.push({
                id: game.id,
                name: game.name,
                url: game.url,
                solo: game.solo,
                multiplayer: game.multiplayer,
                differenceCount: game.differenceImage.length,
            });
        });
        return gamesClient;
    }

    getGame(id: number): Game {
        return this.games.concat(this.tempDeletedGames).find((game) => {
            return game.id === id;
        });
    }

    getDifferencesPositions(id: number): Difference[] {
        return this.getGame(id).differenceImage;
    }

    async addGame(gameInfo: GameDataNumbered): Promise<boolean> {
        const newId = this.getLowestAvailableId();
        const newGame: Game = {
            id: newId,
            name: gameInfo.gameName,
            solo: TOP_SCORES,
            url: 'O' + newId + '.bmp',
            multiplayer: TOP_SCORES,
            differenceImage: gameInfo.differenceImage,
            originalImage: 'assets/bmp_images/O' + newId + '.bmp',
            modifiedImage: 'assets/bmp_images/M' + newId + '.bmp',
        };
        return new Promise<boolean>((resolve) => {
            this.databaseService
                .addGame(newGame)
                .then(() => {
                    this.games.push(newGame);
                    this.writeImageToBMPFile(newGame.originalImage, gameInfo.originalImage);
                    this.writeImageToBMPFile(newGame.modifiedImage, gameInfo.modifiedImage);
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }

    async resetGame(id: number): Promise<void> {
        const position: number = this.getGamePosition(id);
        const updatedGame: Game = this.games[position];
        updatedGame.solo = TOP_SCORES;
        updatedGame.multiplayer = TOP_SCORES;
        return new Promise<void>((resolve, reject) => {
            this.databaseService
                .updateGame(updatedGame)
                .then(() => {
                    this.games[position] = updatedGame;
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    async updateGame(game: Game): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.databaseService
                .updateGame(game)
                .then(() => {
                    this.games[this.games.findIndex((oldGame) => game.id === oldGame.id)] = game;
                    resolve(true);
                })
                .catch(() => {
                    reject('Query Failed');
                });
        });
    }

    async resetGames(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.databaseService
                .resetHighscores()
                .then(() => {
                    this.games.forEach((game) => {
                        game.solo = TOP_SCORES;
                        game.multiplayer = TOP_SCORES;
                    });
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    async deleteGame(id: number, rooms: RoomId[], pendingGames: RoomId[]): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.databaseService
                .removeGame(id)
                .then(() => {
                    if (this.saveTempGames(id, rooms, pendingGames)) {
                        resolve(true);
                        return;
                    }
                    this.games.splice(
                        this.games.findIndex((game) => game.id === id),
                        1,
                    );
                    this.deleteImages(id);
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }

    async deleteGames(rooms: RoomId[], pendingGames: RoomId[]): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            this.databaseService
                .removeAllGames()
                .then(() => {
                    const deletedIDs: number[] = [];
                    [...this.games].forEach((game) => {
                        deletedIDs.push(game.id);
                        if (!this.saveTempGames(game.id, rooms, pendingGames)) this.deleteImages(game.id);
                    });
                    this.games = [];
                    resolve(deletedIDs);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    isGameBeingPlayed(id: number, rooms: RoomId[], pendingGames: RoomId[]): boolean {
        return this.getIdCountInArray(id, rooms) > this.getIdCountInArray(id, pendingGames);
    }

    deleteTempGame(id: number): void {
        if (this.deleteTempGameFromTempList(id)) {
            this.deleteImages(id);
        }
    }

    updateTempDeletedGames(rooms: RoomId[], pendingGames: RoomId[]): void {
        [...this.tempDeletedGames].forEach((game) => {
            if (!this.isGameBeingPlayed(game.id, rooms, pendingGames)) {
                this.deleteTempGame(game.id);
            }
        });
    }

    getNextLimitedGame(gameRoom: GameRoom): number {
        const gamesLeft: number = this.games.length - gameRoom.gameIds.length;
        if (gamesLeft <= 0) return undefined;
        const nextGame: number = Math.floor(Math.random() * gamesLeft);
        return this.games.filter((game) => {
            let isGamePlayed = true;
            gameRoom.gameIds.forEach((gameId) => {
                if (gameId === game.id) isGamePlayed = false;
            });
            return isGamePlayed;
        })[nextGame].id;
    }

    private saveTempGames(id: number, rooms: RoomId[], pendingGames: RoomId[]): boolean {
        if (this.isGameBeingPlayed(id, rooms, pendingGames)) {
            this.tempDeletedGames.push(this.games.splice(this.getGamePosition(id), 1)[0]);
            return true;
        }
        return false;
    }

    private deleteTempGameFromTempList(id: number): boolean {
        return (
            this.tempDeletedGames.splice(
                this.tempDeletedGames.findIndex((game) => game.id === id),
                1,
            ).length > 0
        );
    }

    private async deleteImages(id: number): Promise<void> {
        ['M', 'O'].forEach((imageType: string) => {
            fs.unlink('assets/bmp_images/' + imageType + id + '.bmp', () => {
                return;
            });
        });
    }

    private getIdCountInArray(id: number, arr: RoomId[]): number {
        let count = 0;
        arr.forEach((room) => {
            if (room.gameId === id) count++;
        });
        return count;
    }

    private getLowestAvailableId(): number {
        const ids: number[] = [];
        this.games.concat(this.tempDeletedGames).forEach((game: Game) => ids.push(game.id));
        let lowestId = 0;
        let lowestFound = false;
        while (!lowestFound) {
            if (ids.includes(lowestId)) lowestId++;
            else lowestFound = true;
        }
        return lowestId;
    }

    private getGamePosition(id: number): number {
        return this.games.findIndex((gameElement) => gameElement.id === id);
    }

    private async readGames(): Promise<void> {
        this.games = await this.databaseService.getGames();
    }

    private writeImageToBMPFile(path: string, imageData: number[]) {
        const rawOriginalImage = bmp.encode({
            data: this.convertImageDataToABGRBuffer(imageData),
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
        });
        const imgDir = 'assets/bmp_images/';
        if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);
        fs.writeFileSync(path, rawOriginalImage.data);
    }

    private convertImageDataToABGRBuffer(imageData: number[]) {
        return Buffer.from(this.convertToABGR(imageData));
    }

    private swapValues(index1: number, index2: number, image: number[]): number[] {
        const value = image[index1];
        image[index1] = image[index2];
        image[index2] = value;
        return image;
    }

    private fixAlphaData(image: number[]): number[] {
        const temp = this.convertToABGR(image);
        for (let i = 3; i < image.length; i += BYTES_PER_RGBA_VALUE) temp[i] = MAX_UINT8;
        return temp;
    }

    private convertToABGR(image: number[]): number[] {
        for (let i = 0; i < image.length / BYTES_PER_RGBA_VALUE; i++) {
            const index = i * BYTES_PER_RGBA_VALUE;
            image = this.swapValues(index, index + 3, image);
            image = this.swapValues(index + 1, index + 2, image);
        }
        return image;
    }
}
