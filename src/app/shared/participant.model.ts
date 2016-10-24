

export class Participant {
    callerId: string;
    channel: string;
    muted: boolean;
    phoneNumber: string;
    dateJoined: Date;
    name: string;
    type: string;
    host: boolean;
    commentRequested: boolean;
    millisSinceJoin: number;
}