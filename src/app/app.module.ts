import { NgModule } from 'ng-metadata/core';

import { AppComponent } from './app.component';
import { SidenavComponent } from './sidenav/sidenav.component'
import { EventGeneratorComponent } from './event-generator/event-generator.component'
import { MeetingRoomComponent } from './meeting-room/meeting-room.component'
import { SidenavToggleComponent } from './sidenav-toggle/sidenav-toggle.component'

import { MeetingService, ParticipantService, SwitchBoardService, HistoryService, RoomService } from './shared';

import * as router from 'angular-route';
import * as ngMaterial from 'angular-material';
import { provideState } from './app.config';


@NgModule( {
  declarations: [
    AppComponent,
    SidenavComponent,
    MeetingRoomComponent,
    SidenavToggleComponent,
    EventGeneratorComponent
  ],
  providers: [
    ngMaterial,
    router,
    provideState,
    MeetingService, 
    ParticipantService,
    SwitchBoardService,
    HistoryService,
    RoomService
  ]
} )
export class AppModule {
}
