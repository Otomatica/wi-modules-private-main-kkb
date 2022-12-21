import angular from 'angular';
import componentTemplate from './overview.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$element', '$state', 'maDataPointTags', 'maDialogHelper']);

class overviewSettingsController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maDataPointTags, maDialogHelper) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maDataPointTags = maDataPointTags;
        this.maDialogHelper = maDialogHelper;

        this.$scope.$watch('$ctrl.setting', (nV, oV) => {
            if(!nV) return;
            nV.tags.forEach(x => this.tagObjects[this.tags.indexOf(x.key)] = x);
        });

        this.$scope.$watch('$ctrl.setting.tags', (nV, oV) => {
            this.graphCount = 0;
            if(!nV) return;
            nV.forEach(x => Object.keys(x.graphs).forEach(y => this.graphCount += x.graphs[y].length ));
        }, true);

        this.resetState();
    }

    $onInit() {
        this.maDataPointTags.keys().then(e => {
            this.tags = e.sort();
            this.tagObjects = this.tags.filter(x => x != 'device' && x != 'name').map(x => ({key:x}));
        });
    }

    save() {
        this.storeItem.save().then(e => {
            this.storeItem = e;
            this.setting = e.jsonData;
            this.maDialogHelper.toastOptions({textTr: ['overview.settings.meSaved']});
            this.selected = null;
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['overview.settings.meNotSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        }); 
    }

    copyTags() {
        this.selected.tags = angular.copy(this.selected.tags)
    }

    tagSelected(tag) {
        this.viewTags = [];

        tag.maxDepth = tag.maxDepth || 0;
        tag.files = tag.files || [];
        tag.graphs = tag.graphs || {};
        tag.tagGroups = tag.tagGroups || [];
        tag.tags = tag.tags || [tag.key];
        tag.tags = angular.copy(tag.tags); //fix reselection
        this.selected = tag; 
        this.graphValue = null;
        this.graphValues = [];
        this.maDataPointTags.values(tag.key, []).then(values => this.graphValues = values);
    }

    resetState() {
        if(this.preview) return;
        this.$state.params.key = undefined;
        this.$state.params.value = undefined;
        this.$state.params.device = undefined;
        this.$scope.$root.navigate();
    }
}

export default {
    bindings: {},
    require: {},
    controller: overviewSettingsController,
    template: componentTemplate
};