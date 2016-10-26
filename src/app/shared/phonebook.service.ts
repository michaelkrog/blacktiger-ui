import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';

@Injectable()
export class PhonebookService {

    onUpdate = new EventEmitter();
    constructor(@Inject('$http') private http: ng.IHttpService) {}
    
    updateEntry(phoneNumber: string, newName: string) {
        let url = '/phonebook/' + phoneNumber;
        this.http.put(url, name).then(function () {
            this.onUpdate.emit(null);
        });
    }
    
}