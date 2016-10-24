import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Room } from './room.model';
import { Participant } from './participant.model';
import { SwitchBoardService } from './switch-board.service';
import { ConferenceEvent, ConferenceStartEvent, ParticipantEvent, PhonebookUpdateEvent} from './event.model';

@Injectable()
export class HistoryService {
    private historyVariableName;
    private history = {};

    onHistoryUpdated = new EventEmitter();

    public constructor(@Inject('$log') private log: ng.ILogService, switchBoard: SwitchBoardService) {
        log.debug('Initializing HistorySvc');
        this.historyVariableName = 'meetingHistory-1';
        // var history = localStorageService.get(historyVariableName);

        if (!history || !angular.isObject(history)) {
            this.cleanHistory(false);
        }

        switchBoard.onConferenceStart.subscribe((ev: ConferenceStartEvent) => this.handleConferenceStart(ev.room));
        switchBoard.onJoin.subscribe((ev: ParticipantEvent) => this.handleJoin(ev.roomNo, ev.participant));
        switchBoard.onLeave.subscribe((ev: ParticipantEvent) => this.handleLeave(ev.roomNo, ev.participant.channel));
        switchBoard.onChange.subscribe((ev: ParticipantEvent) => this.handleChange(ev.roomNo, ev.participant));
        switchBoard.onPhoneBookUpdate.subscribe((ev: PhonebookUpdateEvent) => this.handlePhoneBookUpdate(ev.phoneNumber, ev.newName));

    }

    totalDurationForEntry(entry): number {
        let duration = 0;
        let now = new Date();
        angular.forEach(entry.calls, function (call) {
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

            angular.forEach(history, function (room, key) {
                let entriesToDelete = [];
                angular.forEach(room, function (entry, key) {
                    for (let i = entry.calls.length - 1; i >= 0; i--) {
                        if (entry.calls[i].end !== null) {
                            entry.calls.splice(i, 1);
                        }
                    }

                    if (entry.calls.length === 0) {
                        entriesToDelete.push(key);
                    } else {
                        entry.firstCall = entry.calls[0].start;
                    }
                });

                for (let i = 0; i < entriesToDelete.length; i++) {
                    delete room[entriesToDelete[i]];
                }
            });
        } else {
            this.history = {};
        }
        // localStorageService.set(historyVariableName, history);
        this.fireUpdated();
    }

    createRoomEntry(roomNo: string) {
        this.log.debug('Creating new entry.');
        history[roomNo] = {};
    }

    handleConferenceStart(room: Room) {
        this.log.debug('HistorySvc:handleConferenceStart');
        let initializing = false;
        
        if (history[room.id] === undefined) {
            this.createRoomEntry(room.id);
        }

        if (angular.isArray(room.participants)) {
            this.log.debug('Conference had ' + room.participants.length + ' participants. Emitting them as events.');
            for (let i = 0; i < room.participants.length; i++) {
                this.handleJoin(room.id, room.participants[i], initializing);
            }
        }
    }

    handleJoin(roomNo: string, participant: Participant, resume?: boolean) {
        this.log.debug('HistorySvc:handleJoinEvent');
        let entries; 
        let entry;
        let key; 
        let timestamp = new Date().getTime();
        
        if (participant.millisSinceJoin) {
            timestamp -= participant.millisSinceJoin;
        }

        // Ignore the host. It will not be part of the history.
        if (participant.host) {
            return;
        }

        if (!angular.isDefined(history[roomNo])) {
            this.createRoomEntry(roomNo);
        }

        if (!angular.isDefined(participant.callerId)) {
            throw 'Participant does not have a callerId specified.';
        }

        entries = history[roomNo];
        key = participant.callerId;
        this.log.debug('New participant - adding to history [key=' + key + '].');
        if (entries[key] === undefined) {
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
            entries[key] = entry;
        } else {
            entry = entries[key];
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

        if (!angular.isDefined(history[roomNo])) {
            this.createRoomEntry(roomNo);
        }

        let entries = history[roomNo];
        for (let key in entries) {
            let entry = entries[key];
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
        }

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
        angular.forEach(history, function (entries) {
            angular.forEach(entries, function (entry) {
                if (phoneNumber === entry.phoneNumber) {
                    entry.name = name;
                }
            });
        });
        // localStorageService.set(historyVariableName, history);
        this.fireUpdated();
    }

    doFind(room?: string, callerId?: string, active?: boolean): Room[] {
        if (room && !angular.isString(room)) {
            throw 'Room must be specified as String.';
        }

        let array = [];
        let currentRoom: string;

        this.log.debug('Finding entries [room=' + room + ';callerId=' + callerId + ';active=' + active + ']');
        for (currentRoom in history) {
            if (!angular.isDefined(room) || room === room) {
                for (let key in history[currentRoom]) {
                    let accepted = true;
                    let _active = false;
                    let entry = history[currentRoom][key];

                    if (angular.isDefined(callerId)) {
                        accepted = (entry.callerId === callerId);
                    }

                    if (angular.isDefined(active)) {
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
                        array.push(angular.copy(entry));
                    }
                }
            }
        }
        this.log.debug('Found ' + array.length + ' entries');
        return array;
    }

  

    getTotalDurationByRoomAndCallerId(room, callerId): number {
        let duration = 0;
        let entries = this.doFind(angular.isObject(room) ? room.id : room, callerId);
        if (entries && entries.length > 0) {
            duration = this.totalDurationForEntry(entries[0]);
        } else {
            this.log.debug('HistorySvc.getTotalDurationByRoomAndCallerId: No entry found [room=' + room + ';callerId=' + callerId + ']');
        }
        return duration;
    }

    findOneByRoomAndCallerId(room, callerId) {
        let entries = this.doFind(angular.isObject(room) ? room.id : room, callerId);
        if (entries.length === 0) {
            return null;
        } else {
            return entries[0];
        }
    }

    deleteAll(keepActiveCalls) {
        this.cleanHistory(keepActiveCalls);
    }

    findAll() {
        return this.doFind();
    }

    findAllByRoom(room) {
        return this.doFind(angular.isObject(room) ? room.id : room);
    }

    findAllByActive(active) {
        return this.doFind(undefined, undefined, active);
    }

    findAllByRoomAndActive(room, active) {
        return this.doFind(angular.isObject(room) ? room.id : room, undefined, active);
    }

    getVariableName() {
        return this.historyVariableName;
    }
}