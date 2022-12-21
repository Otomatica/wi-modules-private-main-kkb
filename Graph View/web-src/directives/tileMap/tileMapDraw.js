import './../../../web/lib/leaflet-draw/leaflet.draw.css';

import angular from 'angular';

class TileMapDrawController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$compile', 'maUiSettings', '$mdColors', 'wiGraphView']; }
    
    constructor($scope, $element, $transclude, $compile, maUiSettings, $mdColors, wiGraphView) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        this.$compile = $compile;
        this.wiGraphView = wiGraphView;
        
        this.mapCtrl = $scope.$mapCtrl;
        this.primary = $mdColors.getThemeColor(maUiSettings.activeTheme+'-primary');
        this.accent = $mdColors.getThemeColor(maUiSettings.activeTheme+'-accent');
        this.warn = $mdColors.getThemeColor(maUiSettings.activeTheme+'-warn');
    }

    $onInit() {
        window.L = window.L || this.mapCtrl.leaflet;
        let self = this;

        import(/* webpackMode: "eager", webpackChunkName: "leaflet.draw" */ './../../../web/lib/leaflet-draw/leaflet.draw.js').then(() => {
            //TODO localize
            //https://github.com/Leaflet/Leaflet.draw/blob/master/src/Leaflet.draw.js
            //window.L.drawLocal.edit.toolbar.actions.clearAll.title = 'Clear all layers';
            self.$scope.$watch('$ctrl.context', () => this.initDraw());
            self.$scope.$watch('$ctrl.defaultColor', (nV, oV) => {
                if(nV == oV) return;
                self.setDefaultColor();
            });
        });
    }
    
    $onDestroy() {
        this.drawControl && this.drawControl.remove();
        this.editableLayers && this.editableLayers.remove();
        this.mapCtrl.map.off(L.Draw.Event.DELETESTOP);
        this.mapCtrl.map.off(L.Draw.Event.EDITSTOP);
        this.mapCtrl.map.off(L.Draw.Event.DELETED);
        this.mapCtrl.map.off(L.Draw.Event.EDITED);
    }

    getDrawOptions() {
        return {
            position: 'topleft',
            draw: {
                rectangle: { 
                    showArea: false,
                    shapeOptions: {
                        color: this.defaultColor,
                        opacity: 1
                    }
                },
                circle: { 
                    showRadius: false,
                    shapeOptions: {
                        color: this.defaultColor,
                        opacity: 1
                    }
                },
                polyline: { 
                    showLength: false,
                    shapeOptions: {
                        color: this.defaultColor,
                        opacity: 1
                    }
                },
                polygon: {
                    shapeOptions: {
                        color: this.defaultColor,
                        opacity: 1
                    }
                },
                marker: {
                    icon: this.wiGraphView.createIcon('flag', this.defaultColor)
                },
                circlemarker: { 
                    color: 'white',
                    opacity: 1,
                    fillColor: 'black',
                    fillOpacity: 0.5
                },
            },
            edit: {
                featureGroup: this.editableLayers //REQUIRED!!
                //edit: true,
                //remove: true
            }
        };
    }

    initDraw() {
        this.$onDestroy();
        this.editableLayers = new window.L.FeatureGroup();
        this.mapCtrl.map.addLayer(this.editableLayers);

        let options = this.getDrawOptions();
        this.drawControl = new L.Control.Draw(options);
        this.mapCtrl.map.addControl(this.drawControl);

        this.mapCtrl.map.on(L.Draw.Event.CREATED, e => {
            let layer = e.layer;
            let type = e.layerType;

            layer.config = {};
            layer.config.type = type;
            layer.config.latlng = (type == 'marker' || type == 'circle' || type == 'circlemarker') ? layer._latlng : layer._latlngs;
            if (type == 'marker' ) layer.config.icon = 'flag';
            if (type == 'circle') layer.config.radius = layer._mRadius;

            this.createEditorPopup(layer);
            this.editableLayers.addLayer(layer);
            this.getLayers();
        });
        
        this.mapCtrl.map.on(L.Draw.Event.DELETESTOP, e =>  this.setDefaultColor());
        this.mapCtrl.map.on(L.Draw.Event.EDITSTOP, e =>  this.setDefaultColor());
        
        this.mapCtrl.map.on(L.Draw.Event.DELETED, e => this.getLayers());
        this.mapCtrl.map.on(L.Draw.Event.EDITED, e => {
            Object.values(e.layers._layers).forEach(layer => {
                layer.config.latlng = layer._latlng || layer._latlngs;
                if (layer.config.type == 'circle') layer.config.radius = layer._mRadius;
            });
            this.getLayers();
        });

        this.context.layers.forEach(config => {
            let layerOptions = {color: this.defaultColor};

            let type = config.type;
            if(type == 'marker') layerOptions.icon = this.wiGraphView.createIcon(config.icon, this.defaultColor);
            if(type == 'circle') layerOptions.radius = config.radius;
            if(type == 'circlemarker') {
                let freePoint = !config.data || config.data.heatMapIndex == undefined;
                let colors = [this.primary, this.accent, this.warn];
                layerOptions.color = freePoint ? 'white' : colors[config.data.heatMapIndex];
                layerOptions.opacity = 1;
                layerOptions.fillColor = 'black';
                layerOptions.fillOpacity = 0.5;
                layerOptions.radius = 10;
                type = 'circleMarker';
            }

            let layer = L[type](config.latlng, layerOptions);
            layer.config = config;
            this.createEditorPopup(layer);
            layer.addTo(this.editableLayers);
        });
    }

    createEditorPopup(layer) {
        layer.bindPopup('', { minWidth: 400 }); //, keepInView: true
        layer.on('popupopen', () => {
            this.setLayerColor(layer, 'red');
            this.$scope.$apply(() => {
                layer.popupScope = this.$scope.$new();
                layer.popupScope.layer = layer;
                layer.popupScope.context = this.context;
                let com = this.$compile('<wi-graph-feature-config></wi-graph-feature-config>')(layer.popupScope);
                layer._popup.setContent(com[0], { minWidth: 400 });
            });
        });
        layer.on('popupclose', () => {
            layer.popupScope.$destroy();
            layer.bindPopup('', { minWidth: 400 });
            this.setLayerColor(layer, this.defaultColor);
        });
    }

    getLayers() {
        this.$scope.$apply(() => {
            this.context.layers = Object.values(this.editableLayers._layers).map(x => x.config);
        });
    }

    setDefaultColor() {
        let options = this.getDrawOptions();
        this.drawControl._toolbars.draw.setOptions(options.draw);
        Object.values(this.editableLayers._layers).forEach(layer => this.setLayerColor(layer, this.defaultColor));
    }

    setLayerColor(layer, color) {
        if(layer.popupScope && !layer.popupScope.$$destroyed) return;
        if(layer.config.type != 'circlemarker' && layer.config.type != 'marker')
            layer.setStyle({color: color});
        if(layer.config.type == 'marker' && layer._icon) {
            let icon = this.wiGraphView.createIcon(layer.config.icon, color);
            layer.setIcon(icon);
        }
    }

}

function tileMapDrawDirective() {
    return {
        scope: true,
        controllerAs: '$ctrl',
        bindToController: {
            context: '=?',
            defaultColor: '<?'
        },
        designerInfo: {
            hideFromMenu: true
        },
        transclude: 'element',
        controller: TileMapDrawController
    };
}

export default tileMapDrawDirective;