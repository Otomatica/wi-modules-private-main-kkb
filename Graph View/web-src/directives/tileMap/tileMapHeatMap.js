
class TileMapHeatMapController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$compile']; }
    
    constructor($scope, $element, $transclude, $compile) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        this.$compile = $compile;
        
        this.mapCtrl = $scope.$mapCtrl;
        window.L = window.L || this.mapCtrl.leaflet;
    }

    $onInit() {
        let self = this;
        import(/* webpackMode: "eager", webpackChunkName: "leaflet-heat" */ './../../../web/lib/leaflet-heat.min.js').then(() => {
            self.initControl();
            self.initOverlay();
            self.$scope.$watch('$ctrl.config', (nV ,oV) =>  nV != oV && self.initOverlay(), true);
        });
    }
    
    $onDestroy() {
        this.heatLayer && this.heatLayer._frame && window.cancelAnimationFrame(this.heatLayer._frame);
        this.heatLayer && this.heatLayer.remove();
        this.heatControl && this.heatControl.remove();
    }

    initOverlay() {
        if(this.$scope.$$destroyed) return;
        this.heatLayer && this.heatLayer.remove();
        if(!this.layers || !this.config.enabled || !this.pointLayers.length) {
            !this.config.enabled && this.pointLayers && this.pointLayers.forEach(x => delete x.data.point);
            return;
        };
        this.heatLayer = L.heatLayer([], this.config.options);
        this.heatLayer.addTo(this.mapCtrl.map);
        this.updateOverlay();
    }

    updateOverlay(layer, value) {
        if(!this.heatLayer || this.$scope.$$destroyed) return;
        layer && (layer.data.value = value);
        let points = this.pointLayers.filter(x => x.data.value != undefined);
        let latLngs = points.map(x => [x.latlng.lat, x.latlng.lng, x.data.value]);
        this.heatLayer.setLatLngs(latLngs);
    }

    initControl() {
        if(this.$scope.$$destroyed) return;
        this.heatControl && this.heatControl.remove();
        if(!this.editMode) {
            if(!this.layers) return;
            this.pointLayers = this.layers.filter(x => x.data && x.data.heatMapIndex == this.index && x.data.pointXid);
            this.pointLayers = angular.copy(this.pointLayers);
            if(!this.pointLayers.length) return;
        }

        this.createControl();
        let options = { position: this.config.position || 'topright'};
        this.heatControl = new L.Control.HeatControl(options);
        this.heatControl.addTo(this.mapCtrl.map);
    }

    deleteGradient(key) {
        delete this.config.options.gradient[key];
    }

    createControl() {
        let self = this;
        L.Control.HeatControl = L.Control.extend({
            onAdd: function(map) {
                let sliders = angular.element(`
                    <div>
                        <md-icon ng-class="($ctrl.config.enabled || $ctrl.editMode) && $ctrl.config.class" ng-click="$ctrl.config.active=true;" ng-if="!$ctrl.config.active">
                            <md-tooltip ng-bind="$ctrl.config.title" md-direction="{{$ctrl.config.position && $ctrl.config.position.includes('left') ? 'right' : 'left'}}">
                            </md-tooltip>
                            {{$ctrl.config.icon || 'menu'}}
                        </md-icon>
                        <div ng-if="$ctrl.heatLayer && ($ctrl.config.enabled || $ctrl.editMode)">
                            <div ng-repeat="layer in $ctrl.pointLayers">
                                <wi-tile-map-shape ng-if="points[$index] && layer.data.value != undefined" realtime="$ctrl.realtime" time="$ctrl.time" config="layer"></wi-tile-map-shape>
                                <!--TODO use wi-point-value to get value without getting point when websocket return values respecto to permission-->
                                <ma-get-point-value point-xid="{{layer.data.pointXid}}" point="points[$index]"></ma-get-point-value>
                                <ma-get-point-value ng-if="$ctrl.realtime" point="points[$index]" on-value-updated="$ctrl.updateOverlay(layer, point.value);"></ma-get-point-value>
                                <ma-point-values ng-if="!$ctrl.realtime" point="points[$index]" on-values-updated="$ctrl.updateOverlay(layer, $values[0].value);" from="$ctrl.time" to="$ctrl.time + 1">
                                </ma-point-values>
                            </div>
                        </div>
                        <div md-colors="{background: 'background'}" layout="column" ng-if="$ctrl.config.active">
                            <md-toolbar layout layout-align="space-between center" ng-class="$ctrl.config.class" class="md-hue-3">
                                 <md-switch flex class="wi-switch-label" 
                                    ng-class="$ctrl.config.class" 
                                    ng-model="$ctrl.config.enabled">
                                    <span ng-bind="$ctrl.config.title"></span>
                                </md-switch>
                                <md-icon ng-bind="$ctrl.config.icon"></md-icon>
                                <md-icon ng-click="$ctrl.config.active = false;">remove</md-icon>
                            </md-toolbar>
                            <div class="md-padding">
                                <div ng-if="$ctrl.editMode" class="ma-margin-bottom" layout="column">
                                     <md-input-container>
                                        <label ma-tr="ui.app.description"></label>
                                        <input ng-model="$ctrl.config.title" required></input>
                                    </md-input-container>   
                                    <md-input-container>
                                        <label>Icon</label>
                                        <input ng-model="$ctrl.config.icon"></input>
                                    </md-input-container>  
                                    <div layout>
                                        <md-input-container style="max-width:75px;">
                                            <label ma-tr="ui.app.limit"></label>
                                            <input type="number" min="0" required
                                                ng-model="$ctrl.config.limit" 
                                                ng-change="$ctrl.config.limit < $ctrl.config.options.max && ($ctrl.config.options.max = $ctrl.config.limit)">
                                            </input>
                                        </md-input-container>  
                                        <md-input-container flex>
                                            <label>Position</label>
                                            <md-select ng-model="$ctrl.config.position" ng-change="$ctrl.heatControl.setPosition($ctrl.config.position)">
                                               <md-option ng-value="'topright'"><span>Top right</span></md-option>
                                               <md-option ng-value="'topleft'"><span>Top left</span></md-option>
                                               <md-option ng-value="'bottomright'"><span>Bottom right</span></md-option>
                                               <md-option ng-value="'bottomleft'"><span>Bottom left</span></md-option>
                                            </md-select>
                                        </md-input-container>
                                    </div>
                                </div>
                                <ma-calc input="$ctrl.config.options.max * $ctrl.config.options.minOpacity" output="$ctrl.min"></ma-calc>
                                <div layout="column">
                                    <div flex layout layout-align="space-between center" ng-repeat="key in $ctrl.config.options.gradient | wiToArray | orderBy:null:true">
                                        <ma-color-picker ng-model="$ctrl.config.options.gradient[key]"></ma-color-picker>
                                        <span ng-bind="(key * $ctrl.config.options.max - $ctrl.min * (key - 1)).toFixed(1)"></span>
                                        <span flex></span>
                                        <md-icon ng-click="$ctrl.deleteGradient(key)">clear</md-icon>
                                    </div> 
                                    <div flex layout layout-align="space-between center">
                                        <ma-color-picker ng-model="newColor"></ma-color-picker>
                                        <md-slider-container>
                                            <span ng-init="newKey=0" ng-bind="(newKey * $ctrl.config.options.max - $ctrl.min * (newKey - 1) ).toFixed(1)"></span>
                                            <md-slider min="0" max="1" step="0.1" ng-model="newKey" ng-class="$ctrl.config.class"></md-slider>
                                        </md-slider-container>
                                        <md-icon ng-click="newColor && ($ctrl.config.options.gradient[newKey] = newColor)">add</md-icon>
                                    </div>

                                    <div layout>
                                        <md-slider-container>
                                            <span ng-bind="$ctrl.config.options.blur"></span>
                                            <md-slider min="1" max="100" ng-model="$ctrl.config.options.blur" md-vertical ng-class="$ctrl.config.class"></md-slider>
                                            <span ma-tr="graphView.heatmap.blur"></span>
                                        </md-slider-container>
                                        <md-slider-container>
                                            <span ng-bind="$ctrl.config.options.radius"></span>
                                            <md-slider min="1" max="100" ng-model="$ctrl.config.options.radius" md-vertical ng-class="$ctrl.config.class"></md-slider>
                                            <span ma-tr="graphView.heatmap.radius"></span>
                                        </md-slider-container>
                                        <md-slider-container>
                                            <span ng-bind="$ctrl.config.options.max.toFixed(1)"></span>
                                            <md-slider min="0" max="{{$ctrl.config.limit}}" ng-model="$ctrl.config.options.max" md-vertical ng-class="$ctrl.config.class"></md-slider>
                                            <span ma-tr="graphView.heatmap.max"></span>
                                        </md-slider-container>
                                        <md-slider-container>
                                            <span ng-bind="$ctrl.min.toFixed(1)"></span>
                                            <md-slider min="0" max="1" step="0.1" ng-model="$ctrl.config.options.minOpacity" md-vertical ng-class="$ctrl.config.class"></md-slider>
                                            <span ma-tr="graphView.heatmap.min"></span>
                                        </md-slider-container>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`);
                self.$compile(sliders)(self.$scope);
                return sliders[0];
            }
        });
    }
}

function tileMapHeatMapDirective() {
    return {
        scope: true,
        controllerAs: '$ctrl',
        bindToController: {
            editMode: '<?',
            config: '=?',
            layers: '<?',
            index: '<?',
            realtime: '<?',
            time: '<?'
        },
        designerInfo: {
            hideFromMenu: true
        },
        transclude: 'element',
        controller: TileMapHeatMapController
    };
}

export default tileMapHeatMapDirective;