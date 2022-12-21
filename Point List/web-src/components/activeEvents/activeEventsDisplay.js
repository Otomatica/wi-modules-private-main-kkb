import componentTemplate from './activeEventsDisplay.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maEvents']);
class activeEventsDisplayController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maEvents) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maEvents = maEvents;
    }

    $onInit() {

    }

    openEvents($event, alarmLevel = 'any', activeStatus = 'any') {
        this.showDialog = true;
        this.alarmLevel = alarmLevel ;
        this.activeStatus = activeStatus;
    }
}

export default {
    bindings: {
        icon: '@?',
        promise: '<?',
        activeEvents: '<?',
        pointQuery: '<?',
        popupTitle: '<?',
        showSingleEvent: '<?',
        disableDeviceLink: '<?',
    },
    require: {},
    controller: activeEventsDisplayController,
    template: componentTemplate
};