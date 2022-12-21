import componentTemplate from './historyTable.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maUiDateBar']);
class historyTableController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maUiDateBar) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$scope.dateBar = maUiDateBar;
        this.$scope.$watch('$ctrl.points', (nV, oV) => {
            let newIds = nV && nV.map(x => x.id) || [];
            let oldIds = this.$scope.points && this.$scope.points.map(x => x.id) || [];
            let changed = (newIds.length != oldIds.length) || !newIds.every(id => oldIds.includes(id));
            if(!changed) return;

            nV.forEach(x => {
                let oldPoint = (this.chartPoints || []).find(y => y.id == x.id);
                x.showCol = oldPoint ? oldPoint.showCol : undefined;
            });
            let devices = nV.map(x => x.deviceName);
            let distinct = (value, index, self) => self.indexOf(value) === index;
            this.sameDevice = devices.filter(distinct).length <= 1;
            this.$scope.points = angular.copy(nV);
        }, true);
    }

    valuesUpdated(values, chartPoints) {
        if(!chartPoints || !values) return;
        let filteredPoints = chartPoints.filter(x => x.showCol);
        this.filteredValues = values.filter(value => {
            for(let i=0; i<filteredPoints.length; i++)
                if(value['value_' + filteredPoints[i].xid + '_rendered']) return true;
            return false;
        });
    }

    togglePoint(point, state) {
        point.showCol = state;
        this.valuesUpdated(this.values, this.chartPoints);
    }

    $onInit() {
        this.$scope.query = {
            limit : 10,
            page : 1,
            order :  '-timestamp'
        };
    }
}

export default {
    bindings: {
        points : '<?'
    },
    require: {},
    controller: historyTableController,
    template: componentTemplate
};