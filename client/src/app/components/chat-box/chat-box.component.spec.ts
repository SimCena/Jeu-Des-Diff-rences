// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket.service';
import { Authors, Chat } from '@common/chat';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameHandlerService } from '@app/services/game-handler.service';
import { ChatBoxComponent } from './chat-box.component';

@Injectable({
    providedIn: 'root',
})
class MockSocketService extends SocketService {
    on(): void {
        return;
    }

    send(): void {
        return;
    }

    isSocketAlive(): boolean {
        return true;
    }

    unsubscribeMessageSent(): void {
        return;
    }
}

@Injectable({
    providedIn: 'root',
})
class MockGameService extends GameHandlerService {}

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let socketService: SocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            providers: [
                {
                    provide: SocketService,
                    useClass: MockSocketService,
                },
                {
                    provide: GameHandlerService,
                    useClass: MockGameService,
                },
                ChildrenOutletContexts,
                UrlSerializer,
            ],
            imports: [HttpClientTestingModule, AppMaterialModule, RouterTestingModule],
        }).compileComponents();

        socketService = TestBed.inject(SocketService);
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call subscribeMessageSent from socketService if socket is alive', () => {
            const spy = spyOn(socketService, 'subscribeMessageSent');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should call unsubscribeMessageSent from socketService if socket is alive', () => {
            const spy = spyOn(socketService, 'unsubscribeMessageSent');
            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
        it('should call subscribeMessageSent from socketService if socket is alive', () => {
            const spy = spyOn(socketService, 'unsubscribeMessageSent');
            spyOn(socketService, 'isSocketAlive').and.returnValue(false);
            component.ngOnDestroy();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('validateInput', () => {
        it('should calls markAsTouched on the message FormControl', () => {
            const spy = spyOn(component['message'], 'markAsTouched');

            component['validateInput']();
            expect(spy).toHaveBeenCalled();
        });
        it('should calls updateValueAndValidity on the message FormControl', () => {
            const spy = spyOn(component['message'], 'updateValueAndValidity');

            component['validateInput']();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('sendMessage', () => {
        beforeEach(() => {
            spyOn(socketService, 'getSocketId').and.returnValue('');
        });
        it('should call threatenBan() if message includes matcorb cringe', () => {
            const spy = spyOn(socketService, 'sendMessage');
            const spyThreat = spyOn(GameHandlerService.prototype, 'threatenBan');
            component['message'].setValue('matcorb cringe');
            component['sendMessage']();
            expect(spy).toHaveBeenCalled();
            expect(spyThreat).toHaveBeenCalled();
        });
        it('should call threatenBan() if message includes matcorb', () => {
            const spy = spyOn(socketService, 'sendMessage');
            const spyThreat = spyOn(GameHandlerService.prototype, 'threatenBan');
            component['message'].setValue('matcorb');
            component['sendMessage']();
            expect(spy).toHaveBeenCalled();
            expect(spyThreat).toHaveBeenCalled();
        });
        it('should call sendMessage() on socketService', () => {
            const spy = spyOn(socketService, 'sendMessage');
            component['message'].setValue('test');
            component['sendMessage']();
            expect(spy).toHaveBeenCalled();
        });
        it('should reset the message box value to an empty string', () => {
            component['message'].setValue('test');
            component['sendMessage']();
            expect(component['message'].value).toEqual('');
        });
        it('should send a message with the player name and the message', () => {
            const spy = spyOn(socketService, 'sendMessage');
            component['message'].setValue('test');
            component['gameHandlerService'].playerName = 'player1';
            component['sendMessage']();
            expect(spy).toHaveBeenCalledWith({ author: 'player1', socketId: '', body: 'test' });
        });
        it('should not send a message if the input box is empty', () => {
            const spy = spyOn(socketService, 'sendMessage');
            component['message'].setValue('');
            component['gameHandlerService'].playerName = 'player1';
            component['sendMessage']();
            expect(spy).toHaveBeenCalledTimes(0);
        });
    });

    describe('getMessagesList', () => {
        let messages: Chat[];
        beforeEach(() => {
            messages = [
                { body: '1', socketId: '', author: Authors.System },
                { body: '2', socketId: '', author: Authors.System },
                { body: '3', socketId: '', author: Authors.System },
                { body: '4', socketId: '', author: Authors.System },
            ];
            component['messages'] = messages;
        });
        it('should return the list of messages but reversed', () => {
            const reversedMessages = [
                { body: '4', socketId: '', author: Authors.System },
                { body: '3', socketId: '', author: Authors.System },
                { body: '2', socketId: '', author: Authors.System },
                { body: '1', socketId: '', author: Authors.System },
            ];
            expect(component['getMessagesList']()).toEqual(reversedMessages);
        });
        it('should not affect the actual message list', () => {
            component['getMessagesList']();
            expect(component['messages']).toBe(messages);
        });
    });

    describe('getMessageClass', () => {
        it('should return "system-message" if the author is system', () => {
            const message = { body: 'test', socketId: '', author: Authors.System };
            expect(component['getMessageClass'](message)).toEqual('system-message');
        });
        it('should return "player0-message" if the author is the current player', () => {
            spyOn(socketService, 'getSocketId').and.returnValue('1');
            component['gameHandlerService'].playerName = 'test';
            const message = { body: 'test', socketId: '1', author: 'test' };
            expect(component['getMessageClass'](message)).toEqual('player0-message');
        });
        it('should return "player1-message" if the author is the other player', () => {
            spyOn(socketService, 'getSocketId').and.returnValue('1');
            component['gameHandlerService'].playerName = 'test';
            const message = { body: 'test', socketId: '2', author: 'author' };
            expect(component['getMessageClass'](message)).toEqual('player1-message');
        });
    });

    describe('getErrorMessage', () => {
        it('should return an error message if the message is too long', () => {
            component['message'].setErrors({ maxlength: true });
            expect(component['getErrorMessage']()).toBe('Maximum de 200 caractères');
        });
        it('should return nothing if the message is not too long', () => {
            expect(component['getErrorMessage']()).toBe('');
        });
    });

    describe('subscribeMessageUpdate', () => {
        let message: Chat;

        beforeEach(() => {
            component['messages'] = [];
            message = {
                author: 'simon',
                socketId: '',
                body: 'test message',
            };
        });
        it('subscribeMessageUpdate callback should add a message to this.messages', () => {
            const testMessagesArray: Chat[] = [];
            spyOn(socketService, 'subscribeMessageSent').and.callFake((callback) => {
                return callback(message);
            });
            testMessagesArray.push(message);
            component.ngOnInit();
            expect(component['messages']).toEqual(testMessagesArray);
        });
        it('subscribeMessageUpdate callback should set nativeElement.scrollTop to 0', () => {
            const testMessagesArray: Chat[] = [];
            spyOn(socketService, 'subscribeMessageSent').and.callFake((callback) => {
                return callback(message);
            });
            testMessagesArray.push(message);
            component['chatZone'].nativeElement = { scrollTop: 1 };
            component.ngOnInit();
            expect(component['chatZone'].nativeElement.scrollTop).toEqual(0);
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
