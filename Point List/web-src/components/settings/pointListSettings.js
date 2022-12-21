import angular from 'angular';
import componentTemplate from './pointListSettings.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$state', 'wiPointList', 'maDialogHelper', 'maDataPointTags']);

class pointListSettingsController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $state, wiPointList, maDialogHelper, maDataPointTags) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$state = $state;
        this.wiPointList = wiPointList;
        this.maDialogHelper = maDialogHelper;
        this.maDataPointTags = maDataPointTags;
    }

    $onInit() {
        this.settings = [];
        this.tags = [];
        this.newSetting();
        this.wiPointList.list().then(e => this.settings = e);
        this.maDataPointTags.keys().then(e => this.tags = e.sort());
    }

    save() {
        this.selectedSetting.save().then(e => {
            let index = this.settings.findIndex(item => item.xid === e.xid);
            if(index >= 0) this.settings[index] = e;
            else this.settings.push(e);
            
            this.selectionChanged(e);
            this.maDialogHelper.toastOptions({textTr: ['pointList.settings.meSaved']});
        }, error => {
            if(error.data.result) this.validationMessages = error.data.result.messages;
            this.maDialogHelper.toastOptions({
                textTr: ['pointList.settings.meNotSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        }); 
    }

    delete () {
        this.maDialogHelper.confirm(event, ['pointList.settings.confirmDelete']).then(() => {
            this.selectedSetting.delete().then(e => {
                let index = this.settings.findIndex(item => item.xid === e.xid);
                this.settings.splice(index, 1);

                this.newSetting();
                this.maDialogHelper.toastOptions({textTr: ['pointList.settings.meDeleted']});
            }, error => {
                this.maDialogHelper.toastOptions({
                    textTr: ['pointList.settings.meNotDeleted', error.mangoStatusText],
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
        this.selectedSetting = new this.wiPointList();
        this.createWatchList();
    }

    selectionChanged(selected = null) {
        this.selectedSetting = selected.copy();
        this.selectedText = selected.name;
        this.createWatchList();
    }

    createWatchList() {
        this.watchList = this.wiPointList.createWathcList(this.selectedSetting);
    }

}

export default {
    bindings: {},
    require: {},
    controller: pointListSettingsController,
    template: componentTemplate
};