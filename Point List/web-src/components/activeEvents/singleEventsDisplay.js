import componentTemplate from './singleEventsDisplay.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maPoint']);
class singleEventsDisplayController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maPoint) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maPoint = maPoint;
    }

    $onInit() {
        this.maPoint.getById({id: this.activeEvents.event.eventType.referenceId1})
            .$promise.then(point => this.point = point);
    }
}

export default {
    bindings: {
        icon: '@?',
        activeEvents: '<?'
    },
    require: {},
    controller: singleEventsDisplayController,
    template: componentTemplate
};