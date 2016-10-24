export { AppComponent } from './app.component.ts';
export { SidenavComponent } from './sidenav/sidenav.component';
export { MeetingRoomComponent } from './meeting-room/meeting-room.component';

import { AppComponent } from './app.component.ts';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MeetingRoomComponent } from './meeting-room/meeting-room.component';
import { EventGeneratorComponent } from './event-generator/event-generator.component';
import { SidenavToggleComponent } from './sidenav-toggle/sidenav-toggle.component';

import { provideState } from './app.config';
import { MeetingService, ParticipantService, RoomService, HistoryService, SwitchBoardService} from './shared';

export const PROVIDERS = [
    SidenavComponent,
    MeetingRoomComponent,
    provideState,
    MeetingService,
    ParticipantService,
    RoomService,
    HistoryService,
    SwitchBoardService,
    EventGeneratorComponent,
    SidenavToggleComponent
]
