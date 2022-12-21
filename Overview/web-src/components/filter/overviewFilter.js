
import componentTemplate from './overviewFilter.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state']);
class overviewFilterController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
    }

    $onInit() {

    }

    navigate(item) {
        this.navigateCallback({$item: item});
    }
}

export default {
    bindings: {
        currentSetting: '=?',
        tags: '=?',
        navigateCallback: '&',
        wathcListCallback: '&',
        devices: '=?'
    },
    require: {},
    controller: overviewFilterController,
    template: componentTemplate
};