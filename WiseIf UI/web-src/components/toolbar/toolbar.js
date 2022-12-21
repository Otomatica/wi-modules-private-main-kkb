
import componentTemplate from './toolbar.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$element', '$stateParams', '$mdSidenav', 'maUiDateBar', '$timeout']);
class toolbarController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $stateParams, $mdSidenav, maUiDateBar, $timeout) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$mdSidenav = $mdSidenav;
        this.$stateParams = $stateParams;
        this.maUiDateBar = maUiDateBar;
        this.$timeout = $timeout;
    }

    $onInit() {
        this.$timeout( ()=> {
            //move datebarState to temp
            this.$stateParams.dateBarFulscreen = this.$stateParams.dateBar;
            delete this.$stateParams.dateBar;

            this.$scope.stateParams = this.$stateParams;
            this.$scope.dateBar = this.maUiDateBar;
        });
    }

}
export default {
    bindings: {
        sidenavId: '@?'
    },
    designerInfo: {
        hideFromMenu: true,
    },
    require: {},
    controller: toolbarController,
    template: componentTemplate
};