import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { ParticipantService, RoomService, Room, Participant } from '../shared';
import { SwitchBoardService } from './switch-board.service';
import { ConferenceEvent, ConferenceStartEvent, ParticipantEvent, PhonebookUpdateEvent } from './event.model';

@Injectable()
export class MeetingService {

    private rooms: Room[] = [];
    onMeetingStart = new EventEmitter<Room>();
    onMeetingEnd = new EventEmitter<Room>();
    onMeetingJoin = new EventEmitter();
    onMeetingLeave = new EventEmitter();
    onMeetingChange = new EventEmitter();

    constructor(@Inject('$log') private log: ng.ILogService, private participantService: ParticipantService,
        private roomService: RoomService, switchBoard: SwitchBoardService) {

        switchBoard.onInitializing.subscribe(() => this.handleInitializing());
        switchBoard.onLostConnection.subscribe(() => this.handleLostConnection());
        switchBoard.onConferenceStart.subscribe((ev: ConferenceStartEvent) => this.handleConfStart(ev.room));
        switchBoard.onConferenceEnd.subscribe((ev: ConferenceEvent) => this.handleConfEnd(ev.roomNo));
        switchBoard.onJoin.subscribe((ev: ParticipantEvent) => this.handleJoin(ev.roomNo, ev.participant));
        switchBoard.onLeave.subscribe((ev: ParticipantEvent) => this.handleLeave(ev.roomNo, ev.participant.channel));
        switchBoard.onCommentRequest.subscribe((ev: ParticipantEvent) => this.handleCommentRequest(ev.roomNo, ev.participant.channel));
        switchBoard.onCommentRequestCancel.subscribe((ev: ParticipantEvent) => 
            this.handleCommentRequestCancel(ev.roomNo, ev.participant.channel));
        switchBoard.onMute.subscribe((ev: ParticipantEvent) => this.handleMute(ev.roomNo, ev.participant.channel));
        switchBoard.onUnmute.subscribe((ev: ParticipantEvent) => this.handleUnmute(ev.roomNo, ev.participant.channel));
        switchBoard.onPhoneBookUpdate.subscribe((ev: PhonebookUpdateEvent) => this.handlePhoneBookUpdate(ev.phoneNumber, ev.newName));
        
    }

    private getRoomById(id: string): Room {
        this.log.debug('Retrieving room by id [id=' + id + ']');
        let i;
        for (i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id === id) {
                this.log.debug('Room found');
                return this.rooms[i];
            }
        }
        return null;
    }

    private hasHost(room): boolean {
        let i;
        if (room && room.participants) {
            for (i = 0; i < room.participants.length; i++) {
                if (room.participants[i].host === true) {
                    return true;
                }
            }
        }
        return false;
    }

    private getParticipantFromRoomByChannel(room, channel): Participant {
        let i;
        if (room && room.participants) {
            for (i = 0; i < room.participants.length; i++) {
                if (room.participants[i].channel === channel) {
                    return room.participants[i];
                }
            }
        }
        return null;
    }

    private getParticipantsCountByFilter(filter: Function): number {
        let count = 0;
        let p;
        for (let i = 0; i < this.rooms.length; i++) {
            for (let e = 0; e < this.rooms[i].participants.length; e++) {
                p = this.rooms[i].participants[e];
                if (!filter || filter(p) === true) {
                    count++;
                }
            }
        }
        return count;
    }

    private handleInitializing() {
        this.rooms = [];
    };

    private handleLostConnection() {
        this.rooms.forEach((room) => {
            room.participants.forEach((participant) => {
                this.handleLeave(room.id, participant.channel);
            });
            this.handleConfEnd(room.id);
        });
        this.rooms = [];
    }

    private handleConfStart(room: Room) {
        let existingRoom = this.getRoomById(room.id);
        this.log.debug('ConfStartEvent [room=' + room + ']');
        if (existingRoom === null) {
            if (!room.participants) {
                room.participants = [];
            }
            this.rooms.push(room);
            this.onMeetingStart.emit(room);
        }
    };

    private handleConfEnd(roomNo: string) {
        let room = this.getRoomById(roomNo);

        if (room !== null) {
            this.rooms.splice(this.rooms.indexOf(room), 1);
            this.onMeetingEnd.emit(room);
        }
    };

    private handleJoin(roomNo: string, participant: Participant) {
        let room = this.getRoomById(roomNo);
        if (room != null) {
            let existingParticipant = this.getParticipantFromRoomByChannel(room, participant.channel);

            if (existingParticipant === null) {
                room.participants.push(participant);
                this.onMeetingJoin.emit({room: room, participant: participant});
            }
        }
    };

    private handleChange(roomNo: string, participant: Participant) {
        let room = this.getRoomById(roomNo);
        let existingParticipant = this.getParticipantFromRoomByChannel(room, participant.channel);

        if (existingParticipant !== null) {
            existingParticipant.callerId = participant.callerId;
            existingParticipant.channel = participant.channel;
            existingParticipant.muted = participant.muted;
            existingParticipant.phoneNumber = participant.phoneNumber;
            existingParticipant.name = participant.name;
            existingParticipant.type = participant.type;
            existingParticipant.host = participant.host;
        }
    };

    private handleLeave(roomNo: string, channel: string) {
        let room = this.getRoomById(roomNo);
        let participant = this.getParticipantFromRoomByChannel(room, channel);

        if (participant !== null) {
            let i = room.participants.indexOf(participant);
            room.participants.splice(i, 1);
            this.onMeetingLeave.emit({room: room, participant: participant});
        }
    };

    private handleCommentRequest(roomNo: string, channel: string) {
        let room = this.getRoomById(roomNo);
        let participant = this.getParticipantFromRoomByChannel(room, channel);

        if (participant !== null && !participant.commentRequested) {
            participant.commentRequested = true;
            this.onMeetingChange.emit({room: room, participant: participant});
        }
    };

    private handleCommentRequestCancel(roomNo: string, channel: string) {
        let room = this.getRoomById(roomNo);
        let participant = this.getParticipantFromRoomByChannel(room, channel);

        if (participant !== null && participant.commentRequested) {
            participant.commentRequested = false;
            this.onMeetingChange.emit({room: room, participant: participant});
        }
    };

    private handleMute(roomNo: string, channel: string) {
        let room = this.getRoomById(roomNo);
        let participant = this.getParticipantFromRoomByChannel(room, channel);

        if (participant !== null && !participant.muted) {
            participant.muted = true;
            this.onMeetingChange.emit({room: room, participant: participant});
        }
    };

    private handleUnmute(roomNo: string, channel: string) {
        let room = this.getRoomById(roomNo);
        let participant = this.getParticipantFromRoomByChannel(room, channel);

        if (participant !== null && participant.muted) {
            participant.muted = false;
            participant.commentRequested = false;  // Force the comment request to false now – they have been unmuted
            this.onMeetingChange.emit({room: room, participant: participant});
        }
    };

    private handlePhoneBookUpdate(phoneNumber: string, name: string) {
        this.log.debug('MeetingSvc:handlePhoneBookUpdate');
        this.rooms.forEach((room) => {
            room.participants.forEach((participant) => {
                if (phoneNumber === participant.phoneNumber) {
                    participant.name = name;
                    this.onMeetingChange.emit({room: room, participant: participant});
                }
            });
        });
    }

    getTotalParticipantsByCommentRequested(value: boolean): number {
        return this.getParticipantsCountByFilter((participant) => {
                return participant.host !== true && participant.commentRequested === value;
        });
    }
    
    getTotalParticipantsByMuted(value: boolean): number {
        return this.getParticipantsCountByFilter((participant) => {
            return participant.host !== true && participant.muted === value;
        });
    }
       
    getTotalParticipants(): number {
        return this.getParticipantsCountByFilter((participant) => {
            return participant.host !== true;
        })
    }

    getTotalRooms(): number {
        return this.rooms.length;
    }

    getTotalParticipantsByType(type): number {
        return this.getParticipantsCountByFilter((participant) => {
            return participant.host !== true && participant.type === type;
        });
    }

    findAllIds(): string[] {
        let ids = [];
        for (let i = 0; i < this.rooms.length; i++) {
            ids.push(this.rooms[i].id);
        }
        return ids;
    }

    hasRoom(id): boolean {
        return this.getRoomById(id) !== null;
    }

    findRoom(id): Room {
        return this.getRoomById(id);
    }

    kickByRoomAndChannel(room, participant) {
        this.participantService.kick(room, participant.channel);
    }
        
    muteByRoomAndChannel(room, participant) {
        this.participantService.mute(room, participant.channel);
        participant.commentRequested = false;
    }
        
    unmuteByRoomAndChannel(room, participant) {
        if (!this.hasHost(this.getRoomById(room))) {
            this.log.warn('Room \'' + room + '\' has no host. It is not possible to unmute participants in rooms without a host.')
            return;
        }

        this.participantService.unmute(room, participant.channel);
        participant.commentRequested = false;
    }
        
    clear() {
        this.rooms = [];
    }
}