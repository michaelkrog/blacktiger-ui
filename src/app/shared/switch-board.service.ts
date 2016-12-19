import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Room } from './room.model';
import { ConferenceEvent, ParticipantEvent, PhonebookUpdateEvent } from './event.model';
import { Observable, Subscription } from 'rxjs/Rx';

@Injectable()
export class SwitchBoardService {

    onInitializing = new EventEmitter();
    onLostConnection = new EventEmitter();
    onConferenceStart = new EventEmitter<ConferenceEvent>();
    onConferenceEnd = new EventEmitter<ConferenceEvent>();
    onJoin = new EventEmitter<ParticipantEvent>();
    onLeave = new EventEmitter<ParticipantEvent>();
    onChange = new EventEmitter<ParticipantEvent>();
    onCommentRequest = new EventEmitter<ParticipantEvent>();
    onCommentRequestCancel = new EventEmitter<ParticipantEvent>();
    onMute = new EventEmitter<ParticipantEvent>();
    onUnmute = new EventEmitter<ParticipantEvent>();
    onPhoneBookUpdate = new EventEmitter();

    subscription: Subscription = null;

    constructor( @Inject('$log') private log: ng.ILogService, @Inject('$timeout') private timeout: ng.ITimeoutService) { }

    public setDataSource(observable: Observable<ConferenceEvent>) {
        this.log.debug('Setting datasource');
        if (this.subscription != null) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

        if (observable != null) {
            this.subscription = observable.subscribe((data: ConferenceEvent) => {
                this.log.debug(data);
                this.timeout(() => {
                    switch (data.type) {
                        case 'ConferenceStart':
                            this.onConferenceStart.emit(data);
                            break;
                        case 'ConferenceEnd':
                            this.onConferenceEnd.emit(data);
                            break;
                        case 'Join':
                            this.onJoin.emit(<ParticipantEvent>data);
                            break;
                        case 'Leave':
                            this.onLeave.emit(<ParticipantEvent>data);
                            break;
                        case 'CommentRequest':
                            this.onCommentRequest.emit(<ParticipantEvent>data);
                            break;
                        case 'CommentRequestCancel':
                            this.onCommentRequestCancel.emit(<ParticipantEvent>data);
                            break;
                        
                    }
                });
            });
        }
    }



}