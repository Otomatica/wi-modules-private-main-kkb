
import componentTemplate from './graphViewEditor.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state']);
class graphViewEditorController {

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
    bindings: {
        context: '=?',
        defaultColor: '<?'
    },
    require: {},
    controller: graphViewEditorController,
    template: componentTemplate
};