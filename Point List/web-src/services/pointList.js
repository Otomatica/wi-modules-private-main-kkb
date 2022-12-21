
pointListFactory.$inject = ['maRestResource', 'maTranslate', 'maRqlBuilder', 'maWatchList','maDataPointTags'];
function pointListFactory(RestResource, maTranslate, maRqlBuilder, maWatchList, maDataPointTags) {
    
    const pointListBaseUrl = '/rest/latest/point-list';
    const pointListWebSocketUrl = '/rest/latest/websocket/point-list';
    const pointListXidPrefix = 'PL_';
    
    const defaultProperties = {
        name: 'New point list',
        readPermissions: [],
        editPermissions: [],
        context: {
            defaultColumns: ['device', 'name'], 
            defaultSort: 'name'
        }
    };

    const emptyWatchList = new maWatchList({
        empty: true,
        type: 'query',
        name: maTranslate.trSync('ui.app.newTagWatchList'),
        query: new maRqlBuilder().eq('id', 0).toString()
    });

    class pointListResource extends RestResource {
        static get defaultProperties() {
            return defaultProperties;
        }
        
        static get baseUrl() {
            return pointListBaseUrl;
        }
        
        static get webSocketUrl() {
            return pointListWebSocketUrl;
        }
        
        static get xidPrefix() {
            return pointListXidPrefix;
        }

        static createWathcList(pointList) {
            let context = pointList && pointList.context;
            let defaultTagValues = context && context.defaultTagValues;
            if(!defaultTagValues || defaultTagValues.length == 0) return emptyWatchList;

            let query = new maRqlBuilder().or();
            defaultTagValues.forEach( tag => {
                query.and();
                Object.keys(tag).forEach(key => query.eq('tags.'+ key, tag[key]) );
                query.up();
            });
            query.up();
            
            return new maWatchList({
                type: 'query',
                name: maTranslate.trSync('ui.app.newTagWatchList'),
                query: context.rql ? 'and(' + context.rql + '&' + query.toString() + ')' : query.toString()
            });
        }

        static getDevices(pointList) {
            let wathcList = this.createWathcList(pointList);
            if(!wathcList || wathcList.empty) return Promise.resolve([]);
            let query = wathcList.query.split('tags.').join('');
            return maDataPointTags.queryValues('device', query).then(e => e);
        }
    }
    
    return pointListResource;
}

export default pointListFactory;