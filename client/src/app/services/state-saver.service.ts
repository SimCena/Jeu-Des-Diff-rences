import { Injectable } from '@angular/core';
import { CanvasId } from '@app/models/canvas-id';
import { State } from '@common/state';

@Injectable({
    providedIn: 'root',
})
export class StateSaverService {
    private states: State[];
    private iterator: number;

    constructor() {
        this.setStateSaver();
    }

    saveState(id: CanvasId, data: ImageData): void {
        this.states[++this.iterator] = { id, data };
        this.states = this.states.slice(0, this.iterator + 1);
    }

    cancelState(data: ImageData): State | undefined {
        const lastTouchedId = this.cancelStateId();
        if (this.iterator >= 0 && lastTouchedId !== undefined) {
            return this.updateStates(lastTouchedId, data, this.iterator--);
        }
        return undefined;
    }

    redoState(data: ImageData): State | undefined {
        const lastTouchedId = this.redoStateId();
        if (lastTouchedId !== undefined) {
            return this.updateStates(lastTouchedId, data, ++this.iterator);
        }
        return undefined;
    }

    cancelStateId(): CanvasId | undefined {
        return this.states && this.states[this.iterator] ? this.states[this.iterator].id : undefined;
    }

    redoStateId(): CanvasId | undefined {
        return this.states && this.states[this.iterator + 1] ? this.states[this.iterator + 1].id : undefined;
    }

    setStateSaver(): void {
        this.states = [];
        this.iterator = -1;
    }

    private updateStates(id: number, data: ImageData, iterator: number): State {
        const previousState = this.states[iterator];
        this.states[iterator] = { id, data };
        return previousState;
    }
}
