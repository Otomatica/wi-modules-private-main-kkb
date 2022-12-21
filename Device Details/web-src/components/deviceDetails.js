
import componentTemplate from './deviceDetails.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', '$mdSidenav']);
class deviceDetailsController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, $mdSidenav) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$mdSidenav = $mdSidenav;

        this.$scope.$watch('$root.fullScreen', (nV, oV) => {
            if(nV == oV) return;
            let filterComp = $element[0].querySelector('wi-device-details-filter');
            let container = $element[0].querySelector( '#' + (nV ? 'sidenav' : 'default') + '-filter-container');
            let contains = container.querySelector('wi-device-details-filter');
            !contains && container && filterComp && container.appendChild(filterComp);
            !nV && this.$mdSidenav('deviceFilter').close();
        });
    }

    $onInit() {
        
    }
}

export default {
    bindings: {},
    require: {},
    controller: deviceDetailsController,
    template: componentTemplate
};