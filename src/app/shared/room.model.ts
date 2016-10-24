import { Contact } from './contact.model';
import { Participant } from './participant.model';

export class Room {
    id: string;
    name;
    contact: Contact;
    postalCode: string;
    city: string;
    hallNumber: string;
    phoneNumber: string;
    countryCallingCode: string;
    participants: Participant[];
}