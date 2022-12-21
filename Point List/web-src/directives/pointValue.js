const SUBSCRIPTION_TYPES = ['REGISTERED', 'UPDATE', 'TERMINATE', 'INITIALIZE', 'ATTRIBUTE_CHANGE'];

class PointValueController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', 'maPointEventManager']; }
    
    constructor($scope, $element, maPointEventManager) {
        this.$scope = $scope;
        this.$element = $element;
        this.maPointEventManager = maPointEventManager;
        this.$scope.$watch('$ctrl.xid', () => this.initSubscribe(), true);
    }

    initSubscribe() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        if(!this.xid) return;
        this.unsubscribe = this.maPointEventManager.smartSubscribe(this.$scope, this.xid, SUBSCRIPTION_TYPES, this.websocketHandler.bind(this));
    }

    websocketHandler(event, payload) {
        if (this.xid !== payload.xid) return;
        this.value = payload;
        if (this.onValueUpdated) this.onValueUpdated({value: payload});
    }
}

function pointValueDirective() {
    return {
        scope: true,
        controllerAs: '$ctrl',
        bindToController: {
            xid: '<?',
            value: '=?',
            onValueUpdated: '&?'
        },
        designerInfo: {
            hideFromMenu: true
        },
        transclude: 'element',
        controller: PointValueController
    };
}

export default pointValueDirective;