
import componentTemplate from './deviceDialog.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state']);
class deviceDialogController {

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
}

export default {
    bindings: {},
    require: {},
    controller: deviceDialogController,
    template: componentTemplate
};