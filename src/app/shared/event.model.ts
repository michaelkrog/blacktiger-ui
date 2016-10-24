import { Participant } from './participant.model';
import { Room } from './room.model';

export interface ConferenceEvent {
    roomNo: string;
    type: string;
}

export interface ConferenceStartEvent extends ConferenceEvent{
    room: Room;
}

export interface ParticipantEvent extends ConferenceEvent {
    participant: Participant
}

export interface PhonebookUpdateEvent {
    phoneNumber: string; 
    newName: string;
}