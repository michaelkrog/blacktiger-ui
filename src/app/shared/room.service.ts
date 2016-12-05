import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Room } from './room.model';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { BaseService } from './base.service';
import { Blacktiger } from './blacktiger'

@Injectable()
export class RoomService extends BaseService {

    constructor(@Inject('$http') private http: ng.IHttpService) {
        super();
    }

    findAll(search?: string, mode?: string): Promise<Room[]> {
        let config: angular.IRequestShortcutConfig = {
            headers: {
                common: {
                    search: search,
                    mode: mode
                }
            }
        };

        return this.http.get(Blacktiger.serviceUrl + '/rooms', this.appendAuth(config)).then(response => response.data);
    }

    get(id): Promise<Room> {
        return this.http.get(Blacktiger.serviceUrl + '/rooms/' + id, this.appendAuth()).then(response => response.data);
    }

    save(room: Room): Promise<Room> {
        return this.http.put(Blacktiger.serviceUrl + '/rooms/' + room.id, this.appendAuth()).then(response => response.data);
    }
}
