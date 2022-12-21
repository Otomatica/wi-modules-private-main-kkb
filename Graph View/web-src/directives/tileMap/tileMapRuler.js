
class TileMapRulerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$compile', 'maEvents']; }
    
    constructor($scope, $element, $transclude, $compile, maEvents) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        this.$compile = $compile;
        this.alarmLevels = maEvents.levels.filter(x => x.key != 'DO_NOT_LOG' && x.key != 'IGNORE');
        
        this.mapCtrl = $scope.$mapCtrl;
    }

    changed() {
        this.onChange({$model: this.model});
    }

    $onInit() {
        window.L = window.L || this.mapCtrl.leaflet;
        let self = this;
        L.Control.RulerControl = L.Control.extend({
            onAdd: function(map) {
                let template = angular.element(` 
                <div layout="column" layout-align="end end">
                    <md-select ng-model="$ctrl.model" ng-change="$ctrl.changed()" ma-tr="ui.app.events" style="margin:5px">
                        <md-option ng-value="undefined" md-option-empty><div layout layout-align="start center"><em ma-tr="ui.app.events"></em></div></md-option>
                        <md-option ng-repeat="option in $ctrl.options track by option.title" ng-value="option">{{option.title}}</md-option>
                    </md-select>
                    <wi-ruler ng-if="$ctrl.model"
                        min-value="$ctrl.model.minValue"
                        max-value="$ctrl.model.maxValue"
                        min-color="{{$ctrl.model.minColor}}"
                        max-color="{{$ctrl.model.maxColor}}"
                        unit="{{$ctrl.model.unit  || '&nbsp;&nbsp;'}}"
                        marks-count="$ctrl.model.marksCount">
                    </wi-ruler>
                    <div ng-if="!$ctrl.model">
                        <md-icon style="margin:10.8px 5px;" ng-repeat="alarmLevel in $ctrl.alarmLevels track by alarmLevel.key" ng-class="alarmLevel.materialClasses">
                            <md-tooltip md-direction="top" ma-tr="{{alarmLevel.translation}}"></md-tooltip>
                            {{alarmLevel.materialIcon}}
                        </md-icon>
                    </div>
                </div>`);
                self.$compile(template)(self.$scope);
                return template[0];
            },

            onRemove: function(map) {
                // Nothing to do here
            }
        });

        let control = new L.Control.RulerControl({
            position: self.position || 'bottomright'
        });

        control.addTo(this.mapCtrl.map);
    }
}

function tileMapRulerDirective() {
    return {
        scope: true,
        controllerAs: '$ctrl',
        bindToController: {
            model: '=?',
            options: '<?',
            position: '@?',
            onChange: '&?'
        },
        designerInfo: {
            hideFromMenu: true
        },
        transclude: 'element',
        controller: TileMapRulerController
    };
}

export default tileMapRulerDirective;