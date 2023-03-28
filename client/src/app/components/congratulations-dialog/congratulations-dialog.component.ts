import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScoreInfo } from '@common/games';
import { TIE } from '@app/constants/constants';
import { PlayerRanking } from '@common/player-ranking';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-congratulations-dialog',
    templateUrl: './congratulations-dialog.component.html',
    styleUrls: ['./congratulations-dialog.component.scss'],
})
export class CongratulationsDialogComponent {
    protected readonly tie: string;
    protected type: typeof PlayerRanking;
    protected iconPathMap: Map<PlayerRanking, string>;

    private formattedTimeMap: Map<PlayerRanking, string>;

    constructor(
        public dialogRef: MatDialogRef<CongratulationsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public scoreInfo: ScoreInfo,
        private snackBar: MatSnackBar,
    ) {
        this.type = PlayerRanking;
        this.iconPathMap = new Map<PlayerRanking, string>([
            [PlayerRanking.First, 'assets/images/gold-cup.png'],
            [PlayerRanking.Second, 'assets/images/silver-cup.png'],
            [PlayerRanking.Third, 'assets/images/bronze-cup.png'],
            [PlayerRanking.None, ''],
        ]);
        this.formattedTimeMap = new Map<PlayerRanking, string>([
            [PlayerRanking.First, ' (1ère place)'],
            [PlayerRanking.Second, ' (2e place)'],
            [PlayerRanking.Third, ' (3e place)'],
        ]);
        this.tie = TIE;
        this.setErrorPrevention();
    }

    protected getFormattedTime(): string {
        return this.scoreInfo.formattedTime + (this.scoreInfo.isPlayerWinner ? this.formattedTimeMap.get(this.scoreInfo.playerRanking) || '' : '');
    }

    private setErrorPrevention(): void {
        if (this.scoreInfo.playerRanking === PlayerRanking.NotRecorded) {
            this.snackBar.open('Erreur 503 - Impossible de sauvegarder votre score', undefined, { duration: 3500 });
        }
    }
}
