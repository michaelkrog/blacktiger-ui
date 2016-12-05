import { Component, OnInit, Inject } from 'ng-metadata/core';
import { MeetingService, Room, Participant, SwitchBoardService, 
    ConferenceStartEvent, ConferenceEvent, ParticipantEvent } from '../shared';

@Component({
    selector: 'bt-event-generator',
    template: `
  <div layout="row" md-colors="{background: 'warn-50'}" flex>
    <md-button class="md-raised" ng-click="$ctrl.startConf()">Start møde</md-button>
    <md-button class="md-raised" ng-click="$ctrl.endConf()">Stop møde</md-button>
    <md-button class="md-raised" ng-disabled="!$ctrl.meetingRoomActive" ng-click="$ctrl.toggleHost()">Toggle host</md-button>
    <md-button class="md-raised" ng-disabled="!$ctrl.meetingRoomActive || !$ctrl.hasMoreParticipants()" 
        ng-click="$ctrl.addParticipant()">+ Participant</md-button>
    <md-button class="md-raised" ng-disabled="!$ctrl.meetingRoomActive || !$ctrl.hasActiveParticipants()" 
        ng-click="$ctrl.removeParticipant()">- Participant</md-button>
  </div>
  `
})
export class EventGeneratorComponent {

    names = ['Kaj Jensen', 'Yvonne Nielsen', 'Michael Krog', 'Peter Frederiksen', 'Thomas Frederiksen', 'Edmund Atta',
        'Otto Sørensen', 'Otto Ravn', 'Lars Thomsen', 'Michelle Thomsen', 'Jonatan Trip', 'Jens Søndergaard', 'Pernille Madsen',
        'Nicklas Jensen', 'Kezia Jensen', 'Thomas Borch', 'Christina Borch'];
    
    participants: Participant[] = [];
    activeParticipants: Participant[] = [];
    hostActive = false;
    meetingRoomActive = false;

    constructor(private switchBoard: SwitchBoardService) {
        for (let i = 0; i < this.names.length; i++) {
            let p: Participant = {
                callerId: 'L' + (45000000 + i),
                channel: 'L' + (45000000 + i),
                commentRequested: false,
                dateJoined: new Date(),
                host: false,
                millisSinceJoin: 0,
                muted: true,
                name: this.names[i],
                phoneNumber: '+45' + (22000000 + i),
                type: 'Sip'
            }; 
            this.participants.push(p);
        }
    }

    startConf() {
        let ev: ConferenceStartEvent = {
            type: 'ConferenceStart',
            roomNo: '1',
            room: {
                id: '1',
                city: 'Aalborg',
                contact: {
                    comment: '',
                    email: '',
                    name: '',
                    phoneNumber: ''
                },
                countryCallingCode: '45',
                hallNumber: '2',
                name: 'Aalborg 2',
                participants: [],
                phoneNumber: '+4522334455',
                postalCode: '9000'
            }
        };
        this.switchBoard.onConferenceStart.emit(ev);
        this.meetingRoomActive = true;
    }

    endConf() {
        let ev: ConferenceEvent = {
            roomNo: '1',
            type: 'ConferenceEndEvent'
        };
        this.switchBoard.onConferenceEnd.emit(ev);

        this.meetingRoomActive = false;
    }

    toggleHost() {
        let ev: ParticipantEvent = {
            roomNo: '1',
            type: '',
            participant: {
                callerId: 'H45000000',
                channel: 'H45000000',
                commentRequested: false,
                dateJoined: new Date(),
                host: true,
                millisSinceJoin: 0,
                muted: false,
                name: 'Aalborg 2',
                phoneNumber: '+4533445566',
                type: 'Hall'
            }
        };
        if (this.hostActive) {
            this.switchBoard.onLeave.emit(ev);
        } else {
            this.switchBoard.onJoin.emit(ev);
        }
        this.hostActive = !this.hostActive;
    }

    hasActiveParticipants(): boolean {
        return this.activeParticipants.length > 0;
    }

    hasMoreParticipants(): boolean {
        return this.activeParticipants.length < this.participants.length;
    }

    addParticipant() {
        if (this.activeParticipants.length === this.participants.length) {
            return;
        }

        let p: Participant = null;
        while (p === null) {
            p = this.participants[this.getRandomInt(0, this.participants.length)];
            if (this.activeParticipants.indexOf(p) >= 0) {
                p = null;
            }
        }

        let ev: ParticipantEvent = {
            roomNo: '1',
            type: '',
            participant: p
        };
        this.switchBoard.onJoin.emit(ev);
        this.activeParticipants.push(p);
    }

    removeParticipant() {
        if (this.activeParticipants.length > 0) {
            let index = this.getRandomInt(0, this.activeParticipants.length);
            let ev: ParticipantEvent = {
                roomNo: '1',
                type: '',
                participant: this.activeParticipants[index]
            };
            this.switchBoard.onLeave.emit(ev);
            this.activeParticipants.splice(index, 1);
        }
    }

    private getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}