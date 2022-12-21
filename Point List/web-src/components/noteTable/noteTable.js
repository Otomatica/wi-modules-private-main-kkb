import componentTemplate from './noteTable.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maUiDateBar']);
class noteTableController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maUiDateBar) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$scope.dateBar = maUiDateBar;
    }

    $onInit() {
        this.$scope.query = {
            limit : 10,
            page : 1,
            order :  '-timestamp',
            filter : ''
        };
    }
}

export default {
    bindings: {
        points : '<?'
    },
    require: {},
    controller: noteTableController,
    template: componentTemplate
};