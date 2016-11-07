import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/toPromise';

declare var Stomp: StompClientFactory;

interface StompClient {
    subscribe(queue: string, callback: Function);
    send(queue: string, headers: any, data: any);
    connect(credentials: any, onSuccess: Function, onError?: Function);
    disconnect(callback: Function);
    ws: WebSocket;
}

interface StompClientFactory {
    client(url: string): StompClient;
}

@Injectable()
export class StompService {

    stompClient: StompClient;
    heartbeatPromise: Promise<any>;

    constructor(@Inject('$interval') private intervalService: ng.IIntervalService) {
        let url = 'http://localhost:8080';
        if(url.indexOf('http://') === 0) {
            url = 'ws://' + url.substr(7);
        }
        if(url.indexOf('https://') === 0) {
            url = 'wss://' + url.substr(7);
        }
        this.stompClient = Stomp.client(url);
        
    }

    subscribe(queue): Observable<any> {
        let observable = Observable.create((observer: Subscriber<any>) => {
            let subscription = this.stompClient.subscribe(queue, (data) => {
                observer.next(data);
                /* $rootScope.$apply(function () {
                    callback(args[0]);
                }); */
            });
        });
        return observable;
        
    };

    send(queue, headers, data) {
        this.stompClient.send(queue, headers, data);
    };

    connect(user, password, onConnect, onError, enforcedHeartbeatInterval?): Promise<any> {
        // The Spring Stomp implementation does not like user/password, even though it should just ignore it.
        // Sending empty headers instead of user/pass.
        let observable: Observable<any> = Observable.create((observer: Subscriber<any>) => {
            this.stompClient.connect({}, (frame: any) => {
                if(angular.isNumber(enforcedHeartbeatInterval)) {
                    this.heartbeatPromise = this.intervalService(() => {
                        this.stompClient.ws.send('\x0A');
                    }, enforcedHeartbeatInterval);
                }
                observer.next(frame);
            }, (frame: any) => {
                if(angular.isDefined(this.heartbeatPromise)) {
                    this.intervalService.cancel(<ng.IPromise<any>>this.heartbeatPromise);
                }
                observer.error(frame);
            });
        });

        return observable.toPromise();
    };

    disconnect(callback): Promise<any> {
        let observable: Observable<any> = Observable.create((observer: Subscriber<any>) => {
            this.stompClient.disconnect((frame) => {
                observer.next(frame);
                observer.complete();
            });
        });
        return observable.toPromise();
    };

    
}