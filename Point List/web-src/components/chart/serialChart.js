
import componentTemplate from './serialChart.html';
import angular from 'angular';

const storageKey = 'wiSerialChartConfig';
const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maUiDateBar', 'localStorageService', 'MA_ROLLUP_TYPES']);
class serialChartController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maUiDateBar, localStorageService, rollupTypes) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$scope.dateBar = maUiDateBar;
        this.localStorageService = localStorageService;
        this.rollupTypes = rollupTypes;

        this.axisOptions = [
            {name: 'left', translation: 'ui.app.left'},
            {name: 'right', translation: 'ui.app.right'},
            {name: 'left-2', translation: 'ui.app.farLeft'},
            {name: 'right-2', translation: 'ui.app.farRight'}
        ];

        this.$scope.chartOptions = {
            configAllPoints: false,
            configAxes: false,
            valueAxes: this.localStorageService.get(storageKey+'Axis') || {}
        }

        this.chartConfig = this.localStorageService.get(storageKey) || {
            legend: {
                align: 'center',
                spacing: 10,
                verticalGap: 5,
                valueWidth: 100,
                labelWidth: 250
            },
            export: {
                enabled: true,
                libs: {autoLoad: false},
                dateFormat: this.$scope.$root.mangoDateFormats.iso,
                fileName: 'WiseIf Serial Chart',
                exportTitles: true
            }
        };
        
    }

    $onInit() {
        this.$scope.query = {
            limit : 10,
            page : 1,
            order :  'deviceName',
            filter : ''
        };
    }

    buildOptions() {
        let anyMinOrMaxSet = false;
        this.chartConfig.valueAxes = [];
        this.axisOptions.forEach(axisOption => {
            const axis = this.$scope.chartOptions.valueAxes[axisOption.name] || {};

            if(axis.autoScale) {
                delete axis.minimum;
                delete axis.maximum;
                delete axis.strictMinMax;
                delete axis.gridCount;
            }

            const valueAxis = {
                axisColor: axis.color || '',
                color: axis.color || '',
                stackType: axis.stackType || 'none',
                title: axis.title || ''
            };

            if (isFinite(axis.minimum)) {
                valueAxis.minimum = axis.minimum;
                valueAxis.strictMinMax = true;
                anyMinOrMaxSet = true;
            }
            if (isFinite(axis.maximum)) {
                valueAxis.maximum = axis.maximum;
                valueAxis.strictMinMax = true;
                anyMinOrMaxSet = true;
            }
            if (isFinite(axis.gridCount)) {
                valueAxis.gridCount = axis.gridCount;
                valueAxis.autoGridCount = false;
            }

            this.chartConfig.valueAxes.push(valueAxis);
        });
        
        if (anyMinOrMaxSet) {
            this.chartConfig.synchronizeGrid = false;
        }

        this.localStorageService.set(storageKey, this.chartConfig);
        this.localStorageService.set(storageKey+'Axis', this.$scope.chartOptions.valueAxes);
    }
}

export default {
    bindings: {
        points : '<?'
    },
    require: {},
    controller: serialChartController,
    template: componentTemplate
};