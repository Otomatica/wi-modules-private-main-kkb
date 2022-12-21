
import componentTemplate from './dailyChart.html';
import moment from 'moment-timezone';
import angular from 'angular';

const storageKey = 'wiDailyChartConfig';
const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maUiDateBar', 'localStorageService']);
class dailyChartController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maUiDateBar, localStorageService) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$scope.dateBar = maUiDateBar;

        let days = [
            {translation:'dateAndTime.sunday', type: 'line', axis: 'right'},
            {translation:'dateAndTime.monday', type: 'line', axis: 'right'},
            {translation:'dateAndTime.tuesday', type: 'line', axis: 'right'},
            {translation:'dateAndTime.wednesday', type: 'line', axis: 'right'},
            {translation:'dateAndTime.thursday', type: 'line', axis: 'right'},
            {translation:'dateAndTime.friday', type: 'line', axis: 'right'},
            {translation:'dateAndTime.saturday', type: 'line', axis: 'right'}
        ];
        let firstDayOfWeek = moment().localeData().firstDayOfWeek();
        let orderedDays = [...days.slice(firstDayOfWeek, 8-firstDayOfWeek), ...days.slice(0, firstDayOfWeek )];
        let savedDayConfig = localStorageService.get(storageKey + '.serial');
        savedDayConfig && orderedDays.forEach(x => {
            let config = savedDayConfig.find(y => y.translation == x.translation);
            x.type = config && config.type || x.type;
            x.axis = config && config.axis || x.axis;
        });
        
        this.dayConfiguration = orderedDays;
        this.axisOptions = [
            {name: 'left', translation: 'ui.app.left'},
            {name: 'right', translation: 'ui.app.right'},
            {name: 'left-2', translation: 'ui.app.farLeft'},
            {name: 'right-2', translation: 'ui.app.farRight'}
        ];
        this.chartConfig = localStorageService.get(storageKey + '.heat') || {
            colors: ['#0000ff', '#ffff00', '#ff0000'],
            position: 'left'
        }

        this.$scope.$watch('$ctrl.chartConfig', (nV, oV) => {
            localStorageService.set(storageKey + '.heat', nV);
            this.chartConfig.colors = angular.copy(this.chartConfig.colors); //hard refresh heatMap (colors)
        }, true);

        this.$scope.$watch('$ctrl.dayConfiguration', (nV, oV) => {
            localStorageService.set(storageKey + '.serial', nV);
        }, true);

        this.$scope.$watch('$ctrl.points', (nV, oV) => {
            if(!this.point) return;
            this.point = this.points.find(x => x.id == this.point.id);
        }, true);
    }

    formatDates(values) {
        this.dayValues = [];
        for(var i=0; i<7; i++) 
            this.dayValues[i] = values.filter(x => moment(x.timestamp).weekday() == i);
        this.values = values;
    }
}

export default {
    bindings: {
        points : '<?'
    },
    require: {},
    controller: dailyChartController,
    template: componentTemplate
};