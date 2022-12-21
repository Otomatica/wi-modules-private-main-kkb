import componentTemplate from './activeEvents.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maEvents']);
class activeEventsController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maEvents) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maEvents = maEvents;

        this.$scope.$watch('$ctrl.points', (nV, oV) => this.pointIds = nV && nV.map(x => x.id));
        this.$scope.$watch('$ctrl.data.pointIds', (nV, oV) => nV != oV && (this.pointIds = nV));
        this.$scope.$watchCollection('$ctrl.pointIds', () => this.calc(), true);
        this.$scope.$watchCollection('$root.activeEvents', () => this.calc(), true);

        /* default colors
        this.colors = {
            ALL:'#000000',
            NONE: '#9E9E9E',
            INFORMATION: '#00BCD4',
            IMPORTANT: '#00BCD4',
            WARNING: '#4CA631',
            URGENT: '#4CA631',
            CRITICAL: '#FF9800',
            LIFE_SAFETY: '#F44336',
            DO_NOT_LOG: '#9E9E9E',
            IGNORE: '#9E9E9E'
        }*/

        /* overrided colors*/
        this.colors = {
            ALL: '#000000',
            NONE: '#9E9E9E',
            INFORMATION: '#00BCD4',
            IMPORTANT: '#2C919E',
            WARNING: '#FDD835',
            URGENT: '#B46724',
            CRITICAL: '#FF9800',
            LIFE_SAFETY: '#F44336',
            DO_NOT_LOG: '#9E9E9E',
            IGNORE: '#9E9E9E'
        }
    }

    $onInit() {

    }

    calc() {
        if(!this.pointIds || this.pointIds.length == 0) return;
        let newActiveEvents = this.$scope.$root.activeEvents.filter(x => this.pointIds.includes(x.eventType.referenceId1) && (!this.detectorId || x.eventType.referenceId2 == this.detectorId) );
        
        if(!this.activeEvents) this.activeEvents = {};
        let countChanged = this.activeEvents.length != newActiveEvents.length;
        if(countChanged) return this.activeEventsChanged(newActiveEvents);

        let isChanged = newActiveEvents.some(newEvent => {
            let oldEvent = this.activeEvents.events.find(x => x.id == newEvent.id);
            if(!oldEvent) return true;
            if(oldEvent.acknowledged != newEvent.acknowledged) return true;
            return false;
        });

        isChanged && this.activeEventsChanged(newActiveEvents);
    }

    activeEventsChanged(newActiveEvents) {
        this.activeEvents = {};
        this.activeEvents.events = newActiveEvents;
        this.activeEvents.length = newActiveEvents.length;
        this.maEvents.levels.filter(x => x.key != 'DO_NOT_LOG' && x.key != 'IGNORE').forEach(x => {
            this.activeEvents[x.key] = newActiveEvents.filter(y => y.alarmLevel == x.key);
            if(this.activeEvents[x.key].length) {
                this.activeEvents.translation = x.translation;
                this.activeEvents.materialClasses = x.materialClasses;
                this.activeEvents.materialIcon = x.materialIcon;
                this.activeEvents.color = this.colors[x.key];
                this.activeEvents.event = this.activeEvents[x.key][0];

                //for single event display seperated
                this.activeEvents[x.key].translation = x.translation;
                this.activeEvents[x.key].materialClasses = x.materialClasses;
                this.activeEvents[x.key].materialIcon = x.materialIcon;
                this.activeEvents[x.key].event = this.activeEvents[x.key][0];
            }
        });
        this.activeEvents.color = this.activeEvents.color || '#8BC34A';
    }
}

export default {
    bindings: {
        pointQuery: '@?',
        pointIds: '=?',
        points: '<?',
        detectorId: '<?',
        activeEvents: '=?',

        icon: '@?',
        hide: '<?',
        showSingleEvent: '<?',
        popupTitle: '<?',
        disableDeviceLink: '<?'
    },
    require: {},
    controller: activeEventsController,
    template: componentTemplate
};