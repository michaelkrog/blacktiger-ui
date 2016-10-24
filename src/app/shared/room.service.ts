import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Room } from './room.model';

@Injectable()
export class RoomService {

    _rooms: Room[] = [
        {
            id: '1',
            name: 'Aalborg Kærby',
            postalCode: '9000',
            city: 'Aalborg',
            countryCallingCode: '45',
            phoneNumber: '+4522334455',
            hallNumber: '2',
            contact: {
                comment: '',
                email: 'test@test.dk',
                name: 'John Doe',
                phoneNumber: '+4533224433'
            },
            participants: undefined
        }
    ];

    findAll(search?: string, mode?: string): Room[] {
        return this._rooms;
    }

    get(id): Room {
        let room;
        this._rooms.forEach((current) => {
            if (current.id === id) {
                room = current;
            }
        });
        return room;
    }

    save(room: Room): Room {
        return room;
    }
}
