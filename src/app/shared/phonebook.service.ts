import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { BaseService } from './base.service';

@Injectable()
export class PhonebookService extends BaseService {

    onUpdate = new EventEmitter();
    constructor(@Inject('$http') private http: ng.IHttpService) {
        super();
    }
    
    updateEntry(phoneNumber: string, newName: string) {
        let url = '/phonebook/' + phoneNumber;
        this.http.put(url, name, this.appendAuth()).then(function () {
            this.onUpdate.emit(null);
        });
    }
    
}