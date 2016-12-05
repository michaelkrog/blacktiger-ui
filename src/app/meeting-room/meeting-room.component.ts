import { Component, OnInit, Inject } from 'ng-metadata/core';
import { MeetingService, Room, Participant, HistoryService, HistoryEntry } from '../shared';

@Component({
  selector: 'bt-meeting-room',
  styles: [require('./meeting-room.component.scss')],
  template: `
    <md-toolbar class="md-theme-light">
        <div class="md-toolbar-tools">
        <bt-sidenav-toggle></bt-sidenav-toggle>
        <h2>
          <span>Møderum</span>
          <span ng-if="$ctrl.room"> - {{$ctrl.room.name}}</span>
        </h2>
        <span flex></span>
        <md-button class="md-icon-button" aria-label="More">
          <md-icon>more_vert</md-icon>
        </md-button>
      </div>
    </md-toolbar>

    <div layout-padding layout="row" md-colors="{background:'warn-600'}" ng-if="!$ctrl.hasHost()">
      <div layout="column">
        <span class="md-subhead">Der sendes ikke til møderummet.</span>
        <span class="md-caption">Opret forbindelse for at udsende mødet til tilhørerene</span>
      </div>
      <div flex></div>
      <!--div>
        <md-button class="md-raised">Opret forbindelse</md-button>
      </div-->
    </div>

    <div layout-padding layout="row" ng-if="$ctrl.hasHost()">
      <div layout="column">
        <span class="md-subhead">Forbundet</span>
        <span class="md-caption">Siden {{$ctrl.getHost().dateJoined | date:'shortTime'}}</span>
      </div>
      <div flex></div>
      <!--div>
        <md-button class="md-raised">Afbryd forbindelse</md-button>
      </div-->
    </div>


    <md-divider></md-divider>
    <div>
      <md-nav-bar md-selected-nav-item="$ctrl.activeTab" nav-bar-aria-label="navigation links">
        <md-nav-item md-nav-click="$ctrl.goto('activity')" name="activity">Aktive lyttere</md-nav-item>
        <md-nav-item md-nav-click="$ctrl.goto('history')" name="history">
          Historik<span ng-if="$ctrl.historyEntries.length>0"> &#9679;</span>
        </md-nav-item>
      </md-nav-bar>
    </div>
    <md-content flex>
      
      <md-list ng-if="$ctrl.tab === 'activity'">
        
        <md-list-item class="md-2-line" ng-repeat="participant in $ctrl.room.participants | orderBy: 'name' | filter: {host:false}" 
          ng-click="$ctrl.clickParticipant(participant, $event)" md-colors="participant.muted ? {} : {background: 'accent-50'}">
          <md-icon ng-if="!participant.avatar && participant.muted" class="md-avatar-icon">phone</md-icon>
          <md-icon ng-if="!participant.muted" class="md-avatar-icon">volume_up</md-icon>
          <md-progress-circular ng-if="!participant.muted" md-diameter="40" class="md-accent md-hue-3"></md-progress-circular>
          <img ng-src="{{participant.avatar}}" ng-if="participant.avatar" class="md-avatar" />
          <div class="md-list-item-text">
            <h3>{{participant.name}} ({{participant.phoneNumber}})</h3>
            <p>10 minutter - 1 opkald siden 15:50</p>
            <md-button class="md-secondary md-icon-button" ng-click="$ctrl.toggleMute(participant)">
              <md-tooltip>
                <span ng-if="participant.muted">Åbn mikrofon</span>
                <span ng-if="!participant.muted">Luk mikrofon</span>
              </md-tooltip>
              <md-icon class="md-hue-3" ng-if="participant.muted">
                speaker_notes
              </md-icon>
              <md-icon class="md-hue-3" ng-if="!participant.muted">
                speaker_notes_off
              </md-icon>
            </md-button>
            <md-button class="md-secondary md-icon-button" ng-click="$ctrl.kick(participant)">
              <md-tooltip>Afbryd</md-tooltip>
              <md-icon class="md-hue-3">cancel</md-icon>
            </md-button>

          </div>
          <md-divider></md-divider>
        </md-list-item>
      </md-list>

      <md-list ng-if="$ctrl.tab === 'history'">
        
        <md-list-item class="md-3-line" ng-repeat="entry in $ctrl.historyEntries | orderBy: 'name'">
          <md-icon class="md-avatar-icon">phone</md-icon>
          <div class="md-list-item-text">
            <h3>{{entry.name}}</h3>
            <h4>{{entry.totalDuration / 60000 | number:0}} minutter - {{entry.calls.length}} opkald</h4>
            <p>Første opringning {{entry.firstCall | date:'shortTime'}}</p>
            
          </div>
          <md-divider></md-divider>
        </md-list-item>
      </md-list>
    </md-content>
    <bt-event-generator></bt-event-generator>
  `
})
export class MeetingRoomComponent implements OnInit {

  private activeTab = 'activity';
  private room: Room = null;
  private historyEntries: HistoryEntry[] = [];
  private tab = 'activity';

  constructor( @Inject('$log') private log: ng.ILogService,
    @Inject('$mdSidenav') private mdSideNav: ng.material.ISidenavService,
    @Inject('$mdDialog') private mdDialog: angular.material.IDialogService, 
    private meetingService: MeetingService,
    private historyService: HistoryService) {
      
    this.meetingService.onMeetingStart.subscribe((room: Room) => {
      this.room = room;
    });

    this.meetingService.onMeetingEnd.subscribe((room: Room) => {
      this.room = null;
    });

    this.historyService.onHistoryUpdated.subscribe(() => {
      this.historyEntries = this.historyService.findAllByRoomAndActive(this.room, false);
    });
  }

  ngOnInit() {
    this.log.log('Initializing meetingroom');
  }

  goto(tab: string) {
    this.tab = tab;
  }

  toggleMute(participant: Participant) {
    participant.muted = !participant.muted;
  }

  kick(participant: Participant) {
    this.meetingService.kickByRoomAndChannel(this.room.id, participant);
  }

  clickParticipant(p: Participant, ev?: MouseEvent) {
    let prompt = this.mdDialog.prompt()
      .title('Redigér navn')
      .textContent('Angiv nyt navn for ' + p.phoneNumber)
      .placeholder('Navn på person')
      .ariaLabel('Navn på person')
      .initialValue(p.name)
      .targetEvent(ev)
      .ok('Ok')
      .cancel('Annuller');

    this.mdDialog.show(prompt).then(function () {

    });
  }

  hasRoom(): boolean {
    return this.room != null;
  }

  getHost(): Participant {
    let result: Participant = null;

    if (this.room && this.room.participants) {
      for (let i = 0; i < this.room.participants.length; i++) {
        let p = this.room.participants[i];
        if (p.host) {
          result = p;
          break;
        }
      }
    }

    return result;
  }

  hasHost(): boolean {
    let result = false;

    if (this.room && this.room.participants) {
      for (let i = 0; i < this.room.participants.length; i++) {
        let p = this.room.participants[i];
        if (p.host) {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  hasParticipants(): boolean {
    let result = false;

    if (this.room && this.room.participants) {
      for (let i = 0; i < this.room.participants.length; i++) {
        let p = this.room.participants[i];
        if (!p.host) {
          result = true;
          break;
        }
      }
    }

    return result;
  }
}
