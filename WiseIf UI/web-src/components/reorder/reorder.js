
import componentTemplate from './reorder.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element']);
class reorderController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;

        $scope.$watchGroup(['$ctrl.model', '$ctrl.discard'], () => {
            this.showSwitch = false;
            if(!this.model) return;
            if(!this.discard) this.showSwitch = this.model.length > 1;
            else this.showSwitch = this.model.filter(x => !this.discard.includes(x)).length > 1;
        })

    }

    $onInit() {
        
    }

    remove(index) {
        this.model.splice(index, 1);
        this.model = angular.copy(this.model);
    }

}
export default {
    bindings: {
        model: '=?',
        prop: '@?',
        discard: '<?',
        sortableStop: '&?'
    },
    designerInfo: {
        hideFromMenu: true,
    },
    require: {},
    controller: reorderController,
    template: componentTemplate
};