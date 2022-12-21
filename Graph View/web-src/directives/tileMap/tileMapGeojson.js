
class TileMapGeojsonController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$http', '$timeout', 'wiGraphView']; }
    
    constructor($scope, $element, $transclude, $http, $timeout, wiGraphView) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        this.$http = $http;
        this.$timeout = $timeout;
        this.wiGraphView = wiGraphView;
        
        this.mapCtrl = $scope.$mapCtrl;
    }

    initOverlay() {
        this.jsonLayer && this.jsonLayer.remove();
        this.data && this.applyChanges(this.data);
        this.url && this.$http.get(this.url).then( res => this.applyChanges(res.data));
    }

    applyChanges(data) {
        this.jsonLayer = this.mapCtrl.leaflet.geoJSON(data, {
            attribution:`<span class="wi-attribution">${this.wiGraphView.getAttribution()}</span>`,
            onEachFeature: this.onEachFeature,
            filter: (feature, layer) => true,
            style: (feature, layer) => feature.properties.style || this.style
        });
        this.jsonLayer.addTo(this.mapCtrl.map);
    }

    $onInit() {
        this.initOverlay();
        this.$scope.$watch('$root.navLockedOpen', (nV, oV) => {
            if(nV != oV && nV) return;
            this.$timeout( () => !this.$scope.$$destroyed && this.mapCtrl.map.invalidateSize(), 500);
        });
    }
    
    $onChanges(changes) {
        this.initOverlay();
    }
    
    $onDestroy() {
        this.jsonLayer.remove();
    }
}

function TileMapGeojsonDirective() {
    return {
        scope: true,
        controllerAs: '$ctrl',
        bindToController: {
            refresh: '<?',
            data: '<?',
            url: '@?',
            style: '<?',
            onEachFeature: '<?'
        },
        designerInfo: {
            hideFromMenu: true
        },
        transclude: 'element',
        controller: TileMapGeojsonController
    };
}

export default TileMapGeojsonDirective;