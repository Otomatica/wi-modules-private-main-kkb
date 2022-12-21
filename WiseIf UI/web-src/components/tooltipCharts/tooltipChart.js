
import componentTemplate from './tooltipChart.html';
import AmCharts from 'amcharts/amcharts';
import moment from 'moment-timezone';

let global = null;
const $inject = Object.freeze(['$scope', '$mdMedia','$element', 'maUiDateBar']);
class tooltipChartController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, maUiDateBar) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$scope.dateBar = maUiDateBar;
        global = this;
    }

    $onChanges(changes) {
        if(changes.realtime || (changes.time && !this.realtime))
            global.initGuides && global.initGuides();
    }

    $onInit() {
        global.getGuide = () => {
            let guide = new AmCharts.Guide();
            guide.above = true;
            guide.lineAlpha = 1;
            guide.lineThickness = 2;
            guide.dashLength = 2;
            return guide;
        }

        global.setGuide = (axis, field, value, label) => {
            let haveGuide1 = axis.guides.length > 0;
            let guide = haveGuide1 ? axis.guides[0] : global.getGuide();
            guide[field] = value;
            if(label) {
                guide.inside = true;
                guide.position = 'right';
                guide.labelRotation = 90;
                guide.label = axis.currentDateFormat ? moment(label).format(axis.currentDateFormat) : label;
            }
            !haveGuide1 && axis.addGuide(guide);
        }

        global.removeGuide = (chart) => {
            let categoryAxis = global.chart.categoryAxis;
            let valueAxis = chart.valueAxes[0];
            categoryAxis.guides.forEach(g => categoryAxis.removeGuide(g));
            valueAxis.guides.forEach(g => valueAxis.removeGuide(g));
            chart.validateData();
        }

        global.initGuides = () => {
            if(!global.chart) return; 
            if(!global.values || global.realtime) return global.removeGuide(global.chart);
            let closest = global.values.filter(x => x.timestamp <= global.time).slice(-1)[0];
            if(!closest) return;

            if(global.chart.type == 'serial') {
                global.setGuide(global.chart.categoryAxis, 'date', closest.timestamp, closest.timestamp);
                global.setGuide(global.chart.valueAxes[0], 'value', closest.value, closest.rendered);
            }
            else global.setGuide(global.chart.valueAxes[0], 'value', global.time); //actual time

            global.chart.validateData();
        }
    }

    valuesUpdated($values) {
        this.values = $values;
        if(this.point.dataType == 'MULTISTATE' || this.point.dataType == 'BINARY') {
            this.point.notAllowed = $values.length > 500;
            return;
        }

        if(this.isRealTime()) {
            this.values.pop();
            this.bookend =  {
                value: this.values[this.values.length -1].value,
                timestamp: this.values[this.values.length -1].timestamp,
                bookend: true
            };
            this.realTimeUpdate(this.point);
        }
    }

    isRealTime() {
        let notRealTimePresets = ['YEAR_SO_FAR', 'PREVIOUS_DAY', 'PREVIOUS_WEEK', 'PREVIOUS_MONTH', 'PREVIOUS_YEAR'];
        let disableRealtime = !this.$scope.dateBar.preset || notRealTimePresets.includes(this.$scope.dateBar.preset);
        let valueRollupType = this.$scope.dateBar.rollupType == 'POINT_DEFAULT' && this.point.rollup == 'NONE' || this.$scope.dateBar.rollupType == 'NONE';
        if(disableRealtime || !valueRollupType) {
            this.realTimes = [];
            return false;
        }
        return true;
    }

    realTimeUpdate(point) {
        if(!point || point.dataType != 'NUMERIC' || !point.time || !this.isRealTime()) return;
        this.realTimes = this.realTimes || [];
        this.realTimes.push({
            value: point.value,
            timestamp: point.time
        });
        this.connect();
    }

    connect() {
        if(!this.bookend) return;
        let found = this.realTimes.find(x => x.bookend);
        if(!found) this.realTimes.push(this.bookend);
        else {
            found.timestamp = this.bookend.timestamp;
            found.value = this.bookend.value;
        }
        this.realTimes = this.realTimes.filter(x => x.timestamp >= this.bookend.timestamp);
    }

    chartCallback({chart, type}) {
        global.chart = chart;
        global.chart.removeListener(chart, type, global.chartCallback);
        global.initGuides();
        global.rendered = true;
    }
}
export default {
    bindings: {
        numericPoint: '<?',
        point: '=?',
        pointXid: '<?',
        realtime: '<?',
        time: '<?'
    },
    require: {},
    designerInfo: {
        hideFromMenu: true
    },
    controller: tooltipChartController,
    template: componentTemplate
};