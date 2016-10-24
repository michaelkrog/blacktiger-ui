import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Participant } from './participant.model';

@Injectable()
export class ParticipantService {
    _participants: Participant[] = [];
    findAll(roomid): Participant[] {
        return this._participants;
    }
        
    get(roomId, id): Participant {
        let participant;
        this._participants.forEach((current) => {
            if (current.callerId === id) {
                participant = current;
            }
        });
        return participant;
    }

    kick(roomId, id) {

    }
    mute(roomId, id) {
    }
        
    unmute(roomId, id) {
         
    
    }
}