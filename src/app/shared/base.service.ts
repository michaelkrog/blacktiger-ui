import { Blacktiger }  from './blacktiger'

export class BaseService {

    protected appendAuth(config?: angular.IRequestShortcutConfig): angular.IRequestShortcutConfig {
        if (!config) {
            config = {};
        }
        
        if(!config.headers) {
            config.headers = {};
        }
        
        config.headers['Authorization'] = Blacktiger.apiKey;
        return config;
    }
}