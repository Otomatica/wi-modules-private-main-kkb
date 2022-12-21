const SUBSCRIPTION_TYPES = ['REGISTERED', 'UPDATE', 'TERMINATE', 'INITIALIZE', 'ATTRIBUTE_CHANGE'];

class TileMapShapeController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$compile', 'wiGraphView', 'maPoint', 'maEventDetector', 'maPointEventManager', 'maTranslate', 'maPointValues']; }
    
    constructor($scope, $element, $transclude, $compile, wiGraphView, maPoint, maEventDetector, maPointEventManager, maTranslate, maPointValues) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        this.$compile = $compile;
        this.wiGraphView = wiGraphView;
        this.maPoint = maPoint;
        this.maEventDetector = maEventDetector;
        this.maPointEventManager = maPointEventManager;
        this.maTranslate = maTranslate;
        this.maPointValues = maPointValues;
        
        this.mapCtrl = $scope.$mapCtrl;
    }
    
    $onChanges(changes) {
        if(changes.config) {
            this.cleanup();
            this.initializeData();
        }
        else if(changes.realtime || !this.realtime && changes.time) {
            if (this.unsubscribePointValue) {
                this.unsubscribePointValue();
                this.unsubscribePointValue = null;
            }

            if(this.point && !this.realtime) this.getHistoricValue(this.point.xid);
            else this.initializeData();
        }
    }
    
    $onDestroy() {
        this.cleanup();
    }

    cleanup() {
        this.control && this.control.remove();
        this.shape && this.shape.remove();
        this.point = null;
        this.detector = null;
        this.pointIds = [];
        this.points = [];
        this.pointQuery = null;
        this.pointQueryTitle = null;

        if (this.unsubscribePointValue) {
            this.unsubscribePointValue();
            this.unsubscribePointValue = null;
        }

        if(this.unsubscribeActiveEvents) {
            this.unsubscribeActiveEvents();
            this.unsubscribeActiveEvents = null;
        }
    }

    initializeData() {

        if(this.config && !this.config.data) return;
        if(this.config.type != 'circlemarker' && !this.config.displayType) return;
        let data = this.config.data;
        let displayType = this.config.displayType;

        if(displayType == 'point' && !data.pointXid) return;
        if(displayType == 'events' && (!data.eventType || !data.eventData) ) return;
        if(displayType == 'events' && data.eventType == 'point' && !data.eventData.pointXid) return;
        if(displayType == 'events' && data.eventType == 'device' && !data.eventData.deviceName) return;
        if(displayType == 'events' && data.eventType == 'rql' && (!data.eventData.title || !data.eventData.rql)) return;
        if(displayType == 'link' && (!data.key || !data.value)) return;

        this.getData();
    }

    getData() {
        if(this.config.displayType == 'point') 
            this.getPoint(this.config.data.pointXid);
        else if(this.config.displayType == 'events' && this.config.data.eventType == 'point') {
            if(!this.config.data.eventData.detectorXid) this.getPoint(this.config.data.eventData.pointXid);
            else this.getDetector(this.config.data.eventData.detectorXid);
        }
        else if(this.config.displayType == 'events' || this.config.displayType == 'link')
            this.registerActiveEvents();
        else if(this.config.type == 'circlemarker')
            this.initShape();
    }

    getPoint(xid) {
        this.maPoint.get({xid: xid}).$promise.then(point => {
            this.point = point;
            if(this.config.displayType != 'point') return this.registerActiveEvents();
            if(this.realtime)
                this.unsubscribePointValue = this.maPointEventManager.smartSubscribe(this.$scope, point.xid, SUBSCRIPTION_TYPES, this.pointValueChanged.bind(this));
            else
                this.getHistoricValue(point.xid);
        });
    }

    getDetector(detectorXid) {
        let query = this.maEventDetector.get(detectorXid).then(detector => {
            this.point = detector.dataPoint;
            this.detector = detector;
            this.registerActiveEvents();
        });
    }

    registerActiveEvents() {
        this.unsubscribeActiveEvents = this.$scope.$watch('$ctrl.activeEvents', (nV, oV) => nV != oV && this.activeEventsChanged());

        let data = this.config.data;
        let displayType = this.config.displayType;
        if(displayType == 'events' && data.eventType == 'point')
            this.points = [{id: this.point.id}];
        if(displayType == 'events' && data.eventType == 'device')
            this.pointQuery = 'eq(deviceName,' + data.eventData.deviceName + ')';
        if(displayType == 'events' && data.eventType == 'rql'){
            this.pointQuery = data.eventData.rql;
            this.pointQueryTitle = data.eventData.title;
        }
        if(displayType == 'link')
            this.pointQuery = 'eq(tags.' + data.key + ',' + data.value + ')';

        let self = this;
        window.L = window.L || this.mapCtrl.leaflet;
        L.Control.ActiveEvents = L.Control.extend({
            onAdd: function(map) {
                let template = `
                    <wi-active-events hide="true"
                        points="$ctrl.points"
                        point-ids="$ctrl.pointIds"
                        point-query="{{$ctrl.pointQuery}}"
                        detector-id="$ctrl.detector.id"
                        active-events="$ctrl.activeEvents">
                    </wi-active-events>

                    <ma-dialog ng-if="$ctrl.pointQueryTitle"
                        show-dialog="$ctrl.showDialog" 
                        on-hide="$ctrl.showDialog = undefined;" 
                        on-cancel="$ctrl.showDialog = undefined;">
                        <md-dialog flex class="wi-device-view-dialog">
                            <md-toolbar class="md-warn md-hue-3">
                                <div class="md-toolbar-tools">
                                    <span>
                                        <span ma-tr="ui.app.events"></span>: <span ng-bind="$ctrl.pointQueryTitle"></span>
                                    </span>
                                    <span flex></span>
                                    <md-button class="md-icon-button" ng-click="$dialog.cancel()">
                                        <md-icon>close</md-icon>
                                    </md-button>
                                </div>
                            </md-toolbar>

                            <md-dialog-content flex layout="column">
                                <div ng-if="$ctrl.showDialog" ng-init="acknowledged='any'; alarmLevel='any'; activeStatus='any';">
                                    <wi-event-table 
                                        alarm-level="alarmLevel"
                                        acknowledged="acknowledged"
                                        active-status="activeStatus"
                                        point-query="$ctrl.pointQuery">
                                    </wi-event-table>
                                </div>
                            </md-dialog-content>
                        </md-dialog>
                    </ma-dialog>`;
                let comp = self.$compile(template)(self.$scope);
                return comp[0];
            }
        });

        this.control = new L.Control.ActiveEvents({ position: 'bottomleft' });
        this.control.addTo(this.mapCtrl.map);
    }

    getHistoricValue(xid) {
        this.maPointValues.getPointValuesForXid(xid, {
            from: this.time,
            to: this.time + 1,
            xid: xid
        }).then(values => {
            let event = {
                payload: {
                    xid: xid,
                    value: {
                        value : values[0].value
                    }
                }
            };
            this.pointValueChanged(event);
        });
    }

    pointValueChanged(event) {
        let payload = event.payload;
        if (!this.point || this.point.xid !== payload.xid) return;

        let hide = this.config.displayType == 'point' && payload.value.value == this.config.data.hideValue;
        if(hide || payload.value.value == null) return this.shape && this.shape.remove();

        let color = this.point.getRenderedColor(payload.value.value);
        this.initShape(color);
    }

    activeEventsChanged() {
        let hide = !this.config.data.permanent && this.activeEvents.length == 0;
        if(hide) return this.shape && this.shape.remove();

        let color = this.activeEvents.color;
        this.initShape(color, true);
    }

    updateShape(color) {
        if(this.$scope.$$destroyed) return; //check if component destroyed
        if(this.config.type != 'marker') 
            return this.shape.setStyle({color: color});

        let icon = this.wiGraphView.createIcon(this.config.icon, color);
        this.shape.setIcon(icon);
    }

    initShape(color, isActiveEvents) { //todo reRender
        if(this.$scope.$$destroyed) return; //check if component destroyed
        if(this.shape && this.shape._map) {
            isActiveEvents && this.tooltip && this.shape.closeTooltip();
            return this.updateShape(color);
        }

        let layerOptions = {color: color, fillOpacity: 0.5};
        let layerType = this.config.type;
        if(layerType == 'marker') layerOptions.icon = this.wiGraphView.createIcon(this.config.icon, color);
        if(layerType == 'circle') layerOptions.radius = this.config.radius;
        if(layerType == 'circlemarker') {
            if(this.config.data.heatMapIndex == undefined) {
                layerType = 'marker';
                layerOptions = {
                    icon : this.wiGraphView.createPointIcon(this.config.data.pointXid, this.$scope)
                }
            }
            else {
                layerType = 'circle';
                layerOptions = {
                    stroke: false,
                    fillOpacity: 0,
                    radius: 1500
                }
            }
        }
        this.shape = this.mapCtrl.leaflet[layerType](this.config.latlng, layerOptions).addTo(this.$scope.$layer);
        this.registerActions();
    }

    registerActions() {
        this.registerTooltip();
        this.registerPopup();
        this.registerClick();
    }

    registerTooltip() {
        if(this.config.type == 'circlemarker' && this.config.data.heatMapIndex == undefined) return;

        //todo register tooltips by type
        let template = 'No tooltip for type: ' + this.config.type + ' displayType: '+ this.config.displayType;
        
        if(this.config.type == 'circlemarker')
            template = `<wi-tooltip-chart realtime="$ctrl.realtime" time="$ctrl.time" numeric-point="true" point="$ctrl.point" point-xid="$ctrl.config.data.pointXid"></wi-tooltip-chart>`;

        if(this.config.displayType == 'point') 
            template = `<wi-tooltip-chart realtime="$ctrl.realtime" time="$ctrl.time" point="$ctrl.point" point-xid="$ctrl.config.data.pointXid"></wi-tooltip-chart>`;

        else if(this.config.displayType == 'link' || this.config.displayType == 'events') {
            let title = 'No title!';

            if(this.config.displayType == 'link') title = this.config.data.key + ': '+ this.config.data.value;
            else if(this.config.displayType == 'events') {
                if(this.config.data.eventType == 'point') title = this.maTranslate.trSync('ui.app.point') + ': ' + this.point.formatLabel(); //todo if detector is set
                if(this.config.data.eventType == 'device') title = this.maTranslate.trSync('ui.app.device') + ': ' + this.config.data.eventData.deviceName;
                if(this.config.data.eventType == 'rql') title = this.config.data.eventData.title;
            }
            template = `
                <div layout="column" layout-align="start center" style="min-width:250px;">
                    <span md-colors="{
                        'color' : 
                        $ctrl.config.data.eventType == 'point' && 'primary-hue-1' || 
                        $ctrl.config.data.eventType == 'device' && 'accent-hue-1' ||
                        'warn-hue-1'
                    }">${title}</span>
                    <wi-active-events-display icon="{{$ctrl.config.icon}}" active-events="$ctrl.activeEvents" show-single-event="true">
                    </wi-active-events-display>
                </div>`;
        }

        let com = this.$compile('<div ng-if="$ctrl.tooltip">' + template + '</div>')(this.$scope);
        this.shape.bindTooltip(com[0]); //, {sticky: true}

        this.shape.on('tooltipopen', (e) => {
            this.lastTooltipPosition = {latlng: e.tooltip.getLatLng()};
            this.$scope.$apply(() => {
                this.tooltip = true;
                this.shape.setTooltipContent(com[0]);
            });
            this.shape._moveTooltip(this.lastTooltipPosition);
        });

        this.shape.on('tooltipclose', () => {
            if(this.$scope.$$phase || this.$scope.$root.$$phase) return this.tooltip = false;
            this.$scope.$apply(() => this.tooltip = false);
        });
    }

    registerPopup() {

    }

    registerClick() {
        if(this.config.type == 'circlemarker' && this.config.data.heatMapIndex == undefined) return;

        this.shape.on('click', event => {
            this.shape.closeTooltip();
            
            if(this.config.type == 'circlemarker' || this.config.displayType == 'point')
                this.$scope.$root.popupPoint(null, this.point, 'chart');

            if(this.config.displayType == 'link')
                this.$scope.$root.navigate(this.config.data.key, this.config.data.value);

            if(this.config.displayType == 'events' && this.config.data.eventType == 'point')
                this.$scope.$root.popupPoint(null, this.point, 'events');

            if(this.config.displayType == 'events' && this.config.data.eventType == 'device')
                this.$scope.$root.popupDevice(this.config.data.eventData.deviceName, this.activeEvents.length && 'events');

            if(this.config.displayType == 'events' && this.config.data.eventType == 'rql')
                this.showDialog = true;
        });
    }
}

function TileMapShapeDirective() {
    return {
        scope: true,
        controllerAs: '$ctrl',
        bindToController: {
            config: '<?',
            time: '<?',
            realtime: '<?'
        },
        designerInfo: {
            hideFromMenu: true
        },
        transclude: 'element',
        controller: TileMapShapeController
    };
}

export default TileMapShapeDirective;