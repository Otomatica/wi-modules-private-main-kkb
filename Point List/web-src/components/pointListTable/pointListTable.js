
import componentTemplate from './pointListTable.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maUserNotes', 'maUiDateBar', 'maEvents']);
class pointListTableController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maUserNotes, maUiDateBar, maEvents) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maUserNotes = maUserNotes;
        this.$scope.dateBar = maUiDateBar;
        this.alarmLevels = maEvents.levels;
        this.$scope.page = {};

        this.$scope.$watch('$root.selectedPoints', (nV, oV) => {
            if(nV != oV) this.$scope.page.selectedIds = nV.map(x => x.id.toString());
            if(!this.$scope.$root.selectedPoints.length) this.$scope.page.showStats = false;
        }, true);
    }

    $onInit() {
        this.$scope.query = {
            limit: 10,
            page: 1,
            order: this.fixTagColumn(this.sort) || 'name',
            filter: undefined
        };
    }

    fixTagColumn(col) { 
        if(!col || col == 'name') return col;
        return (col == 'device') ? 'deviceName' : ('tags.' + col);
    }

    addNote(event, point) {
        this.maUserNotes.addNote(event, 'Point', point.id).then(c => {
            //callback if needed
        }, err => {
            //rejection
        });
    };
}

export default {
    bindings: {
        overviewSetting: '<?',
        query: '<?',
        columns: '<?',
        sort: '<?'
    },
    require: {},
    controller: pointListTableController,
    template: componentTemplate
};