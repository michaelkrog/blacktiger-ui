import { Injectable, Inject, EventEmitter } from 'ng-metadata/core';
import { Observable, Subscriber } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

declare var Stomp: StompClientFactory;

interface INativeStompClient {
    ws: WebSocket;
    subscribe(queue: string, callback: Function);
    send(queue: string, headers: any, data: any);
    connect(credentials: any, onSuccess: Function, onError?: Function);
    disconnect(callback: Function);
}

interface StompClientFactory {
    client(url: string): INativeStompClient;
}

export class StompClient {

    stompClient: INativeStompClient = null;
    heartbeatPromise = null;

    constructor(url: string) {
        if (url.indexOf('http://') === 0) {
            url = 'ws://' + url.substr(7);
        }
        if (url.indexOf('https://') === 0) {
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

    connect(user, password, enforcedHeartbeatInterval?: number): Promise<any> {
        // The Spring Stomp implementation does not like user/password, even though it should just ignore it.
        // Sending empty headers instead of user/pass.
        let observable: Observable<any> = Observable.create((observer: Subscriber<any>) => {
            this.stompClient.connect({}, (frame: any) => {
                if (enforcedHeartbeatInterval) {
                    this.heartbeatPromise = setInterval(() => {
                        this.stompClient.ws.send('\x0A');
                    }, enforcedHeartbeatInterval);
                }
                observer.next(frame);
                observer.complete();
            }, (frame: any) => {
                if (this.heartbeatPromise !== null) {
                    clearInterval(this.heartbeatPromise);
                    this.heartbeatPromise = null;
                }
                observer.error(frame);
            });
        });

        return observable.toPromise();
    };

    disconnect(): Promise<any> {
        let observable: Observable<any> = Observable.create((observer: Subscriber<any>) => {
            this.stompClient.disconnect((frame) => {
                observer.next(frame);
                observer.complete();
            });
        });
        return observable.toPromise();
    };

    
}