
import componentTemplate from './rollupCheck.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element','maUiDateBar']);
class rollupCheckController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, maUiDateBar) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$scope.dateBar = maUiDateBar;

        this.$scope.$watch('$ctrl.rollup', (nV, oV) => this.setChartPoints(), true);
        this.$scope.$watch('$ctrl.points', () => this.setChartPoints(), true);
    }

    $onInit() {

    }

    setChartPoints() {
        this.clonePoints = angular.copy(this.points);
        if(!this.rollup || !this.clonePoints || !this.clonePoints.length || !this.clonePoints[0]) return this.chartPoints = [];

        this.fixColors();
        if(this.rollup.nonNumeric) return this.chartPoints = this.clonePoints;
        this.chartPoints = this.clonePoints.filter(x => x && x.dataType == 'NUMERIC');
    }

    fixColors() {
        this.clonePoints.filter(x => x.dataType == 'BINARY' || x.dataType == 'MULTISTATE').forEach(x => {
            x.chartRenderColors = x.getTextRenderer().values;
            Object.keys(x.chartRenderColors).forEach(y => {
                x.chartRenderColors[y].colour = x.chartRenderColors[y].colour || x.chartRenderColors[y].color;
            });
        });
    }

}
export default {
    bindings: {
        points: '<?',
        rollup: '=?',
        chartPoints: '=?'
    },
    require: {},
    designerInfo: {
        hideFromMenu: true
    },
    controller: rollupCheckController,
    template: componentTemplate
};