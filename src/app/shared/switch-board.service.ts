import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Room } from './room.model';
import { ConferenceEvent, ParticipantEvent, PhonebookUpdateEvent} from './event.model';
import { Observable } from 'rxjs/Observable';

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

    constructor(@Inject('$log') private log: ng.ILogService) {

    }

    public addDataSource(observable: Observable<ConferenceEvent>) {
        this.log.debug('Adding datasource');
        observable.subscribe((data: ConferenceEvent) => {
            this.log.debug(data);
        });
    }
    
}