
import componentTemplate from './graphView.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'wiGraphView', 'maUiDateBar']);
class graphViewController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, wiGraphView, maUiDateBar) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.wiGraphView = wiGraphView;
        this.$scope.dateBar = maUiDateBar;
    }

    $onInit() {
        this.xid && this.wiGraphView.get(this.xid).then(graphView => this.context = graphView.context);
    }
}

export default {
    bindings: {
        context: '<?',
        xid: '@?'
    },
    designerInfo: {
        icon: 'photo_size_select_large'
    },
    require: {},
    controller: graphViewController,
    template: componentTemplate
};