
import componentTemplate from './deviceDetailsFilter.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'wiPointList']);
class deviceDetailsFilterController {

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
        this.getDevices();
        this.wiPointList.list().then(e => this.pointLists = e);
    }

    getDevices() {
        this.wiPointList.getDevices(this.selectedList).then(e => this.devices = e.sort());
    }
}

export default {
    bindings: {
        pointLists: '=?',
        selectedList: '=?',
        devices: '=?'
    },
    require: {},
    controller: deviceDetailsFilterController,
    template: componentTemplate
};