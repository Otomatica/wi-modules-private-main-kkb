import angular from 'angular';
import componentTemplate from './graphView.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$state', 'wiGraphView', 'maDialogHelper']);

class graphViewSettingsController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $state, wiGraphView, maDialogHelper) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$state = $state;
        this.wiGraphView = wiGraphView;
        this.maDialogHelper = maDialogHelper;
    }

    $onInit() {
        this.newSetting();
        this.wiGraphView.list().then(e => this.settings = e.sort((a, b) => a.name.localeCompare(b.name)));
    }

    save() {
        this.selectedSetting.save().then(e => {
            let index = this.settings.findIndex(item => item.xid === e.xid);
            if(index >= 0) this.settings[index] = e;
            else this.settings.push(e);
            
            this.settings = this.settings.sort((a, b) => a.name.localeCompare(b.name));

            this.maDialogHelper.toastOptions({textTr: ['graphView.settings.meSaved']});
        }, error => {
            if(error.data.result) this.validationMessages = error.data.result.messages;
            this.maDialogHelper.toastOptions({
                textTr: ['graphView.settings.meNotSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        }); 
    }

    delete () {
        this.maDialogHelper.confirm(event, ['graphView.settings.confirmDelete']).then(() => {
            this.selectedSetting.delete().then(e => {
                let index = this.settings.findIndex(item => item.xid === e.xid);
                this.settings.splice(index, 1);

                this.newSetting();
                this.maDialogHelper.toastOptions({textTr: ['graphView.settings.meDeleted']});
            }, error => {
                this.maDialogHelper.toastOptions({
                    textTr: ['graphView.settings.meNotDeleted', error.mangoStatusText],
                    classes: 'md-warn',
                    hideDelay: 5000
                });
            });
        }, angular.noop); 
    }

    newSetting() {
        if(this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
        this.selectedSetting = new this.wiGraphView();
        this.preview = false;
    }

    selectionChanged(selected = null) {
        this.selectedSetting = selected.copy();
        this.selectedText = selected.name;
        this.preview = false;
    }
}

export default {
    bindings: {},
    require: {},
    controller: graphViewSettingsController,
    template: componentTemplate
};