import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Participant } from './participant.model';
import { Observable, Observer } from 'rxjs/Rx';
import { Blacktiger } from './blacktiger';
import { BaseService } from './base.service';

@Injectable()
export class ParticipantService extends BaseService {
    _participants: Participant[] = [];

    constructor(@Inject('$http') private http: ng.IHttpService) {
        super();
    }

    findAll(roomid): Promise<Participant[]> {
        return this.http.get(Blacktiger.serviceUrl + '/rooms/' + roomid + '/participants', this.appendAuth());
    }
        
    get(roomId, channel): Promise<Participant> {
        return this.http.get(Blacktiger.serviceUrl + '/rooms/' + roomId + '/participants/' + channel, this.appendAuth());
    }

    kick(roomId: string, channel: string) {
        return this.http.delete(Blacktiger.serviceUrl + '/rooms/' + roomId + '/participants/' + channel, this.appendAuth());
    }
    mute(roomId: string, id: string) {
    }
        
    unmute(roomId: string, id: string) {
         
    
    }
}