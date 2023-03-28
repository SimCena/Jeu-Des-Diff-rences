import { GameService } from '@app/game/game.service';
import { Attempt } from '@common/attempt';
import { IMAGE_WIDTH } from '@common/constants/image';
import { Coordinate } from '@common/coordinate';
import { Difference, Game } from '@common/games';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidateAttemptService {
    private differences: Map<number, number>;

    constructor(private gameService: GameService) {
        this.differences = new Map();
    }

    setGameData(id: number): void {
        this.differences = new Map();
        const game: Game = this.gameService.getGame(id);
        game.differenceImage.forEach((difference) => {
            difference.positions.forEach((position) => {
                this.differences.set(position, difference.differenceNumber);
            });
        });
    }

    validateAttempt(attempt: Attempt, differencesFound: number[]): Difference | undefined {
        if (this.differences) {
            if (this.differences.has(this.translatePosition(attempt.coords))) {
                const differenceNumber: number = this.differences.get(this.translatePosition(attempt.coords));
                if (!this.isDifferenceFound(differenceNumber, differencesFound)) {
                    return { differenceNumber, positions: this.findDifferencePositions(differenceNumber) };
                }
            }
        }
        return undefined;
    }

    private isDifferenceFound(differenceNumber: number, differencesFound: number[]): boolean {
        let isDifferenceFound = false;
        differencesFound.forEach((foundNumber) => {
            if (foundNumber === differenceNumber) {
                isDifferenceFound = true;
            }
        });
        return isDifferenceFound;
    }

    private translatePosition(position: Coordinate): number {
        return Math.round(position.x) + Math.round(position.y) * IMAGE_WIDTH;
    }

    private findDifferencePositions(differenceNumber: number): number[] {
        const positions: number[] = [];
        this.differences.forEach((difference, position) => {
            if (difference === differenceNumber) positions.push(position);
        });
        return positions;
    }
}
