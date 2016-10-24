import { Component, OnInit, Inject } from 'ng-metadata/core';
import { MeetingService, Room, Participant, SwitchBoardService, 
    ConferenceStartEvent, ConferenceEvent, ParticipantEvent } from '../shared';

@Component({
    selector: 'bt-event-generator',
    template: `
  <div layout="row" md-colors="{background: 'warn-50'}" flex>
    <md-button class="md-raised" ng-click="$ctrl.startConf()">Start møde</md-button>
    <md-button class="md-raised" ng-click="$ctrl.endConf()">Stop møde</md-button>
    <md-button class="md-raised" ng-click="$ctrl.addHost()">+ host</md-button>
    <md-button class="md-raised" ng-click="$ctrl.removeHost()()">- host</md-button>
    <md-button class="md-raised" ng-click="$ctrl.addKarl()">+ Karl</md-button>
    <md-button class="md-raised" ng-click="$ctrl.removeKarl()">- Karl</md-button>
    <md-button class="md-raised" ng-click="$ctrl.addYvonne()">+ Yvonne</md-button>
    <md-button class="md-raised" ng-click="$ctrl.removeYvonne()">- Yvonne</md-button>
  </div>
  `
})
export class EventGeneratorComponent {

    constructor(private switchBoard: SwitchBoardService) {
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
    }

    endConf() {
        let ev: ConferenceEvent = {
            roomNo: '1',
            type: 'ConferenceEndEvent'
        };
        this.switchBoard.onConferenceEnd.emit(ev);
    }

    addHost() {
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
        this.switchBoard.onJoin.emit(ev);
    }

    removeHost() {
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
        this.switchBoard.onLeave.emit(ev);
    }

    addKarl() {
        let ev: ParticipantEvent = {
            roomNo: '1',
            type: '',
            participant: {
                callerId: 'L45000000',
                channel: 'L45000000',
                commentRequested: false,
                dateJoined: new Date(),
                host: false,
                millisSinceJoin: 0,
                muted: true,
                name: 'Karl Johan',
                phoneNumber: '+4533445566',
                type: 'Sip'
            }
        };
        this.switchBoard.onJoin.emit(ev);
    }

    removeKarl() {
        let ev: ParticipantEvent = {
            roomNo: '1',
            type: '',
            participant: {
                callerId: 'L45000000',
                channel: 'L45000000',
                commentRequested: false,
                dateJoined: new Date(),
                host: false,
                millisSinceJoin: 0,
                muted: true,
                name: 'Karl Johan',
                phoneNumber: '+4533445566',
                type: 'Sip'
            }
        };
        this.switchBoard.onLeave.emit(ev);
    }

    addYvonne() {
        let ev: ParticipantEvent = {
            roomNo: '1',
            type: '',
            participant: {
                callerId: 'L45000001',
                channel: 'L45000001',
                commentRequested: false,
                dateJoined: new Date(),
                host: false,
                millisSinceJoin: 0,
                muted: true,
                name: 'Yvonne Nielsen',
                phoneNumber: '+4533445566',
                type: 'Sip'
            }
        };
        this.switchBoard.onJoin.emit(ev);
    }

    removeYvonne() {
        let ev: ParticipantEvent = {
            roomNo: '1',
            type: '',
            participant: {
                callerId: 'L45000001',
                channel: 'L45000001',
                commentRequested: false,
                dateJoined: new Date(),
                host: false,
                millisSinceJoin: 0,
                muted: true,
                name: 'Yvonne Nielsen',
                phoneNumber: '+4533445566',
                type: 'Sip'
            }
        };
        this.switchBoard.onLeave.emit(ev);
    }
}