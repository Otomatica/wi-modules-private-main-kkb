
import componentTemplate from './detectorListTable.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maEventDetector', 'maEvents']);
class detectorListTableController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maEventDetector, maEvents) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maEventDetector = maEventDetector;
        this.maEvents = maEvents;

        this.detectorTypes = angular.copy(maEventDetector.detectorTypes());
        this.detectorTypes.sort((a, b) => a.description.localeCompare(b.description));
        this.$scope.refreshQuery = false;
    }

    $onInit() {
        this.$scope.query = {
            limit : 10,
            page : 1,
            order :  'sourceId',
            filter : ''
        };

        this.maEventDetector.subscribe((event, item) => {
            if(event.name == 'create') {
                let needRefresh = !this.pointIds || !this.pointIds.length || this.pointIds.includes(item.dataPoint.id);
                if(needRefresh) return this.higlightUpdate = true;
            }

            let itemIndex = this.$scope.page.detectors.findIndex(x => x.id == item.id);
            if(itemIndex < 0) return;
            event.name == 'update' && ( this.$scope.page.detectors[itemIndex] = item );
            event.name == 'delete' && ( this.$scope.page.detectors = this.$scope.page.detectors.filter(x => x.id != item.id) );
        }, this.$scope, ['create', 'update', 'delete']);
    }

    description(type) {
        return this.detectorTypes.find(x => x.type == type).description;
    }

    level(eventKey) {
        return this.maEvents.levels.find(x => x.key == eventKey);
    }

    pointsChanged() {
        this.higlightUpdate = false;
        this.pointIds = this.$scope.page.points.map(x => x.id);
    }

    newDetector(point) {
        this.selected = this.maEventDetector.forDataPoint(point); 
        this.shoDialog = true;
    }
}

export default {
    bindings: {},
    require: {},
    controller: detectorListTableController,
    template: componentTemplate
};