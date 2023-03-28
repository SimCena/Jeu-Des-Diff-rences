import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAX_MESSAGE_LENGTH } from '@app/constants/game';
import { GameHandlerService } from '@app/services/game-handler.service';
import { SocketService } from '@app/services/socket.service';
import { Authors, Chat } from '@common/chat';
import { CRINGE, KNOW_NAME, LOVE, MATCORB, MATCORB_BETTER } from '@common/constants/easter';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ChatBoxComponent implements OnInit, OnDestroy {
    @Input() toggleInput: boolean;

    @ViewChild('chatZone') private chatZone: ElementRef;
    protected messages: Chat[];
    protected message: FormControl;

    constructor(private socketService: SocketService, private gameHandlerService: GameHandlerService) {
        this.message = new FormControl('', Validators.maxLength(MAX_MESSAGE_LENGTH));
        this.messages = [];
    }

    ngOnInit(): void {
        if (this.socketService.isSocketAlive()) this.subscribeMessageUpdate();
    }

    ngOnDestroy(): void {
        if (this.socketService.isSocketAlive()) this.socketService.unsubscribeMessageSent();
    }

    protected validateInput(): void {
        this.message.markAsTouched();
        this.message.updateValueAndValidity();
    }

    protected sendMessage(): void {
        if (this.message.value && this.message.valid) {
            // EASTER EGG
            const name: string = this.findInMessage(MATCORB);
            if (this.message.value.includes(CRINGE) && name) {
                this.gameHandlerService.threatenBan();
                this.socketService.sendMessage({
                    author: this.gameHandlerService.playerName,
                    socketId: this.socketService.getSocketId(),
                    body: name + MATCORB_BETTER + name + LOVE,
                });
                return;
            }
            if (name) {
                this.gameHandlerService.threatenBan(KNOW_NAME);
                this.socketService.sendMessage({
                    author: this.gameHandlerService.playerName,
                    socketId: this.socketService.getSocketId(),
                    body: name + MATCORB_BETTER + name + LOVE,
                });
                return;
            }
            this.socketService.sendMessage({
                author: this.gameHandlerService.playerName,
                socketId: this.socketService.getSocketId(),
                body: this.message.value,
            });
            this.message.setValue('');
        }
    }

    protected findInMessage(words: string[]): string {
        let found = '';
        words.forEach((word) => {
            if (this.message.value.includes(word)) found = word;
        });
        return found;
    }

    protected getMessagesList(): Chat[] {
        return [...this.messages].reverse();
    }

    protected getMessageClass(message: Chat): string {
        if (message.author === Authors.System) {
            return 'system-message';
        } else {
            return message.socketId === this.socketService.getSocketId() ? 'player0-message' : 'player1-message';
        }
    }

    protected getErrorMessage(): string {
        if (this.message.hasError('maxlength')) {
            return 'Maximum de 200 caractères';
        }
        return '';
    }

    private subscribeMessageUpdate(): void {
        this.socketService.subscribeMessageSent((message: Chat) => {
            this.messages.push(message);
            if (this.chatZone.nativeElement) {
                this.chatZone.nativeElement.scrollTop = 0;
            }
        });
    }
}
