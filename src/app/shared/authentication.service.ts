import { Inject, Injectable, EventEmitter } from 'ng-metadata/core';
import { Observable } from 'rxjs/Rx';
import { Blacktiger } from './blacktiger';


@Injectable()
export class AuthenticationService {
    private _isAuthenticatedChange: EventEmitter<boolean>;
    private _isAuthenticated: boolean = false;
    private _currentCredentials: string;
    private _currentToken: string;

    constructor( @Inject('$http') private http: ng.IHttpService) {
        this._isAuthenticatedChange = new EventEmitter<boolean>();
    }

    private doAuthenticate(basicToken: string, remember?: boolean): Promise<string> {
        let config = {
            headers: {},
            params: {}
        };

        // var deferred: ng.IDeferred<Token> = this.$q.defer();
        this._currentCredentials = basicToken;
        let token: string = 'Basic ' + basicToken;
        config.headers['Authorization'] = token;

        // let ob: Observable<IToken> = Observable.create();

        // this.$log.info('Authenticating using basic auth.');

        let promise = this.http.get(Blacktiger.serviceUrl + '/system/authenticate', config);
        let observable = Observable.fromPromise(promise);
        return observable
            .map((res: ng.IHttpPromiseCallbackArg<string>) => {
                // this.$log.info('Authentication response received.');


                // if (remember) {
                //    this.localStorageService.add(this.credentialsKey, basicToken);
                // } 


                Blacktiger.apiKey = token;
                this._currentToken = token;

                // this.$log.info('Authenticated. Returning user.');
                // this.authorizationHeader.setToken(token);

                // this.$log.info('Logged in with ' + token.token);
                // this.currentToken = token;
                // this.$rootScope.$broadcast('login', token);
                // deferred.resolve(token);


                this._isAuthenticated = true;
                this._isAuthenticatedChange.emit(true);
                return token;
            }).catch((err) => {
                let res: any = {};
                let reason = res.status === 404 ? null : <any> res.data;
                if (!reason) {
                    reason = {
                        message: 'Unable to communicate with server'
                    };
                }
                // this.localStorageService.remove(this.credentialsKey);
                // this.$log.info('Unable to authenticate: ' + reason.message);
                throw 'Unable to authenticate. Reason: ' + reason.message;

            }).toPromise();

    }

    public authenticate(username: string, password: string, remember?: boolean): Promise<string> {
        let basicToken: string;
        // var deferred: ng.IDeferred<Token> = this.$q.defer();
        // if (!username && !password) {
        //    basicToken = this.localStorageService.get(this.credentialsKey);
        // } else if (username && password) {
        basicToken = btoa(username.trim() + ':' + password.trim());
        // }

        return this.doAuthenticate(basicToken, remember);
    }


    public reauthenticate(): Promise<string> {
        return this.doAuthenticate(this._currentCredentials);
    }

    public deauthenticate() {
        let token = this._currentToken;
        // this.authorizationHeader.setToken(undefined);
        // this.localStorageService.remove(this.credentialsKey);
        this._currentToken = null;
        this._currentCredentials = null;
        this._isAuthenticated = false;
        this._isAuthenticatedChange.emit(false);
    }

    public isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    public get currentToken() {
        return this._currentToken;
    }

    public onChange(): EventEmitter<boolean> {
        return this._isAuthenticatedChange;
    }
}

