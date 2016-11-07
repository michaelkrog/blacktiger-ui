import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Room } from './room.model';
import { Participant } from './participant.model';
import { SwitchBoardService } from './switch-board.service';
import { ConferenceEvent, ConferenceStartEvent, ParticipantEvent, PhonebookUpdateEvent} from './event.model';

export interface Call {
    start: number;
    end: number;
}

export interface HistoryEntry {
    type: string;
    callerId: string;
    phoneNumber: string;
    name: string;
    firstCall: number;
    calls: Call[],
    channel: string;
    totalDuration: number;
}

@Injectable()
export class HistoryService {
    private historyVariableName;
    private history: Map<string, Map<string, HistoryEntry>> = new Map<string, Map<string, HistoryEntry>>();

    onHistoryUpdated = new EventEmitter();

    public constructor(@Inject('$log') private log: ng.ILogService, switchBoard: SwitchBoardService) {
        log.debug('Initializing HistorySvc');
        this.historyVariableName = 'meetingHistory-1';
        // var history = localStorageService.get(historyVariableName);

        // if (!this.history || !angular.isObject(this.history)) {
        this.cleanHistory(false);
        // }

        switchBoard.onConferenceStart.subscribe((ev: ConferenceStartEvent) => this.handleConferenceStart(ev.room));
        switchBoard.onJoin.subscribe((ev: ParticipantEvent) => this.handleJoin(ev.roomNo, ev.participant));
        switchBoard.onLeave.subscribe((ev: ParticipantEvent) => this.handleLeave(ev.roomNo, ev.participant.channel));
        switchBoard.onChange.subscribe((ev: ParticipantEvent) => this.handleChange(ev.roomNo, ev.participant));
        switchBoard.onPhoneBookUpdate.subscribe((ev: PhonebookUpdateEvent) => this.handlePhoneBookUpdate(ev.phoneNumber, ev.newName));

    }

    private resolveRoomNo(room: string | Room): string {
        if (this.isRoom(room)) {
            return room.id;
        } else {
            return room;
        }
    }

    private isRoom(room: String | Room): room is Room {
        return (<Room> room).id !== undefined;
    }

    private isDefined(variable): boolean {
        return typeof variable !== 'undefined' && variable != null;
    }

    private isString(variable): boolean {
        return typeof variable === 'string';
    }

    totalDurationForEntry(entry): number {
        let duration = 0;
        let now = new Date();
        entry.calls.forEach((call) => {
            if (call.end !== null) {
                duration += call.end - call.start;
            } else {
                duration += now.getTime() - call.start;
            }
        });
        
        return duration;
    }

    fireUpdated() {
        this.onHistoryUpdated.emit(null);
    }

    cleanHistory(keepActiveCalls: boolean) {
        this.log.debug('Resetting history data [keepActiveCalls=' + keepActiveCalls + ']');
        if (keepActiveCalls) {
            this.history.forEach((entries, roomNo) => {
                let entriesToDelete = [];

                entries.forEach((entry, index) => {
                    for (let i = entry.calls.length - 1; i >= 0; i--) {
                        if (entry.calls[i].end !== null) {
                            entry.calls.splice(i, 1);
                        }
                    }

                    if (entry.calls.length === 0) {
                        entriesToDelete.push(index);
                    } else {
                        entry.firstCall = entry.calls[0].start;
                    }
                });

                for (let i = 0; i < entriesToDelete.length; i++) {
                    delete entries[entriesToDelete[i]];
                }
            });
        } else {
            this.history = new Map<string, Map<string, HistoryEntry>>();
        }
        // localStorageService.set(historyVariableName, history);
        this.fireUpdated();
    }

    createRoomEntry(roomNo: string) {
        this.log.debug('Creating new entry.');
        this.history.set(roomNo, new Map<string, HistoryEntry>());
    }

    handleConferenceStart(room: Room) {
        this.log.debug('HistorySvc:handleConferenceStart');
        let initializing = false;
        
        if (!this.history.has(room.id)) {
            this.createRoomEntry(room.id);
        }

        if (room.participants) {
            this.log.debug('Conference had ' + room.participants.length + ' participants. Emitting them as events.');
            for (let i = 0; i < room.participants.length; i++) {
                this.handleJoin(room.id, room.participants[i], initializing);
            }
        }
    }

    handleJoin(roomNo: string, participant: Participant, resume?: boolean) {
        this.log.debug('HistorySvc:handleJoinEvent');
        let room: Map<string, HistoryEntry>; 
        let entry: HistoryEntry;
        let key; 
        let timestamp = new Date().getTime();
        
        if (participant.millisSinceJoin) {
            timestamp -= participant.millisSinceJoin;
        }

        // Ignore the host. It will not be part of the history.
        if (participant.host) {
            return;
        }

        if (!this.history.has(roomNo)) {
            this.createRoomEntry(roomNo);
        }

        if (!participant.callerId) {
            throw 'Participant does not have a callerId specified.';
        }

        room = this.history.get(roomNo);
        key = participant.callerId;
        this.log.debug('New participant - adding to history [key=' + key + '].');
        if (!room.has(key)) {
            this.log.debug('Participant has no entry. Creating new entry.');
            entry = {
                type: participant.type,
                callerId: participant.callerId,
                phoneNumber: participant.phoneNumber,
                name: participant.name,
                firstCall: timestamp,
                calls: [],
                channel: participant.channel,
                totalDuration: 0
            };
            room.set(key, entry);
        } else {
            entry = room.get(key);
            entry.channel = participant.channel;
            entry.name = participant.name;
        }

        if (resume && entry.calls.length > 0) {
            this.log.debug('Resuming last call in call list for participant.');
            entry.calls[entry.calls.length - 1].end = null;
        } else {
            this.log.debug('Appending new call to call list for participant.');
            let call = {
                start: timestamp,
                end: null
            };
            entry.calls.push(call);
        }

        this.log.debug('Persisting history.');
        // localStorageService.set(historyVariableName, history);
        this.fireUpdated();
    }

    handleLeave(roomNo: string, channel: string) {
        this.log.debug('HistorySvc:handleLeaveEvent');
        let changed = false;

        if (!this.history.has(roomNo)) {
            this.createRoomEntry(roomNo);
        }

        let room = this.history.get(roomNo);
        room.forEach((entry, key) => {
            if (entry.channel === channel) {
                for (let i = 0; i < entry.calls.length; i++) {
                    let call = entry.calls[i];
                    if (call.end === null) {
                        call.end = new Date().getTime();
                        changed = true;
                    }
                }

                entry.totalDuration = this.totalDurationForEntry(entry);
            }
        });
        
        if (changed) {
            // localStorageService.set(historyVariableName, history);
            this.fireUpdated();
        }
    }

    handleChange(roomNo: string, participant: Participant) {
        this.handlePhoneBookUpdate(participant.phoneNumber, participant.name);
    }

    handlePhoneBookUpdate(phoneNumber: string, name: string) {
        this.log.debug('HistorySvc:handlePhoneBookUpdate');
        this.history.forEach((room: Map<string, HistoryEntry>, roomNo) => {
            room.forEach(entry => {
                if (phoneNumber === entry.phoneNumber) {
                    entry.name = name;
                }
            });
        });
        
        // localStorageService.set(historyVariableName, history);
        this.fireUpdated();
    }

    doFind(room?: string, callerId?: string, active?: boolean): HistoryEntry[] {
        if (room && typeof room !== 'string') {
            throw 'Room must be specified as String.';
        }

        let array = [];
        let currentRoom: string;

        this.log.debug('Finding entries [room=' + room + ';callerId=' + callerId + ';active=' + active + ']');
        this.history.forEach((room) => {
            if (!this.isDefined(room) || room === room) {
                room.forEach((entry) => {
                    let accepted = true;
                    let _active = false;
                
                    if (this.isDefined(callerId)) {
                        accepted = (entry.callerId === callerId);
                    }

                    if (this.isDefined(active)) {
                        _active = false;
                        for (let i = 0; i < entry.calls.length; i++) {
                            let call = entry.calls[i];
                            if (call.end === null) {
                                _active = true;
                                break;
                            }
                        }

                        if (_active !== active) {
                            accepted = false;
                        }
                    }

                    if (accepted) {
                        array.push(entry);
                    }
                });
            }
        });
        this.log.debug('Found ' + array.length + ' entries');
        return array;
    }

  

    getTotalDurationByRoomAndCallerId(room: string | Room, callerId): number {
        let duration = 0;
        let entries = this.doFind(this.resolveRoomNo(room), callerId);

        if (entries && entries.length > 0) {
            duration = this.totalDurationForEntry(entries[0]);
        } else {
            this.log.debug('HistorySvc.getTotalDurationByRoomAndCallerId: No entry found [room=' + room + ';callerId=' + callerId + ']');
        }
        return duration;
    }

    findOneByRoomAndCallerId(room: string | Room, callerId): HistoryEntry {
        let entries = this.doFind(this.resolveRoomNo(room), callerId);
        if (entries.length === 0) {
            return null;
        } else {
            return entries[0];
        }
    }

    deleteAll(keepActiveCalls) {
        this.cleanHistory(keepActiveCalls);
    }

    findAll(): HistoryEntry[] {
        return this.doFind();
    }

    findAllByRoom(room: string | Room): HistoryEntry[] {
        return this.doFind(this.resolveRoomNo(room));
    }

    findAllByActive(active): HistoryEntry[] {
        return this.doFind(undefined, undefined, active);
    }

    findAllByRoomAndActive(room, active): HistoryEntry[] {
        return this.doFind(this.isString(room) ? room : room.id, undefined, active);
    }

    getVariableName(): string {
        return this.historyVariableName;
    }
}