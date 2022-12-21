
import componentTemplate from './stateChart.html';
import angular from 'angular';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', '$timeout', 'maUiDateBar']);
class stateChartController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, $timeout, maUiDateBar) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$timeout = $timeout;
        this.$scope.dateBar = maUiDateBar;
        this.$scope.selectedPointIds = [];

        this.$scope.$watch('$ctrl.points', (nV, oV) => {
            let newPoints = nV && nV.filter(x => x.dataType == 'MULTISTATE' || x.dataType == 'BINARY') || [];

            let newIds = newPoints.map(x => x.id);
            let oldIds = (this.$scope.nonNumericPoints || []).map(x => x.id);

            let changed = (newIds.length != oldIds.length) || !newIds.every(id => oldIds.includes(id));
            changed && (this.$scope.nonNumericPoints = newPoints);
        }, true);
    }
}

export default {
    bindings: {
        points : '<?'
    },
    require: {},
    controller: stateChartController,
    template: componentTemplate
};