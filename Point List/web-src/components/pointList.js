
import componentTemplate from './pointList.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'wiPointList']);
class pointListController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, wiPointList) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.wiPointList = wiPointList;
    }

    $onInit() {
        this.pointLists = [];
        this.createWatchList();
        this.wiPointList.list().then(e => this.pointLists = e);
    }

    createWatchList() {
        this.watchList = this.wiPointList.createWathcList(this.selectedList);
    }
}

export default {
    bindings: {},
    require: {},
    controller: pointListController,
    template: componentTemplate
};