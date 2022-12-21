import angular from 'angular';
import componentTemplate from './deviceDetails.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$element', '$state', 'maDataPointTags', 'maDialogHelper', '$injector']);

class deviceDetailsSettingsController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maDataPointTags, maDialogHelper, $injector) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maDataPointTags = maDataPointTags;
        this.maDialogHelper = maDialogHelper;
        this.$injector = $injector;

        this.$scope.$watch('setting.graphics', (nV, oV) => {
            this.graphCount = 0;
            if(!nV) return;
            Object.keys(nV).forEach(x => this.graphCount += nV[x].length );
        }, true);
    }

    $onInit() {
        let components = [];
        let devModule = {};
        try {
            devModule = angular.module('wiDeviceTemplates');
            components = devModule._invokeQueue.filter(x => x[2][0] != 'wiBaseDevice');
        } catch(e) {};

        this.deviceTemplates = [];
        this.templatePoints = {};
        components.forEach(c => {
            let componentName = c[2][0].replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
            this.deviceTemplates.push({name:componentName, value:false});
            let instance = this.$injector.invoke(c[2][1]);
            let discard = ['deviceName', 'bindingPoints', 'bindingTag'];
            let defaultBindings = Object.keys(instance.bindToController).filter(x => !discard.includes(x));
            let attributes = instance.designerInfo && instance.designerInfo.attributes;
            this.templatePoints[componentName] = defaultBindings.map( x => ({key: x, label: attributes[x] && attributes[x].label}));
        });

        this.maDataPointTags.keys().then(e => {
            this.tags = e.sort();
            this.filteredTags = this.tags.filter(x => x != 'device' && x != 'name');
        });
    }

    save() {
        this.clearEmpty();
        this.$scope.storeItem.save().then(e => {
            this.$scope.storeItem = e;
            this.$scope.setting = e.jsonData;
            this.maDialogHelper.toastOptions({textTr: ['deviceDetails.settings.meSaved']});
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['deviceDetails.settings.meNotSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        }); 
    }

    clearEmpty() {
        if(!this.$scope.setting.graphics) return;
        this.selectedDevice = null;
        let graphs = this.$scope.setting.graphics;
        let devices = Object.keys(graphs);
        devices.forEach(x => {
            graphs[x].forEach(y => {
                if(y.type=='static' || !y.points) return;
                let points =  Object.keys(y.points);
                points.forEach(z => {
                    if(!y.points[z].xid && !y.points[z].point) {
                        delete y.points[z];
                        return;
                    }
                    y.points[z].xid = y.points[z].xid || y.points[z].point.xid;
                    delete y.points[z].point;
                });
                !Object.keys(y.points).length && delete y.points;
            });
            !graphs[x].length && delete graphs[x];
        });
    }

    deviceChanged() {
        if(!this.$scope.setting) return;
        let setting = this.$scope.setting;
        setting.graphics = setting.graphics || {};
        setting.graphics[this.selectedDevice] = setting.graphics[this.selectedDevice] || [];
        this.deviceTemplates.forEach(x => x.value = setting.graphics[this.selectedDevice].find(y => y.type == x.name) && true);
    }

    checkboxChanged(template) {
        let values = this.$scope.setting.graphics[this.selectedDevice];
        if(template.value)  return values.push({type: template.name, title: template.name});
        
        let current = values.find(x => x.type == template.name);
        let index = values.indexOf(current);
        (index > -1) && values.splice(index, 1);
    }

    addFileGroup(fileGroupTitle) {
        if(!fileGroupTitle) return;
        let setting = this.$scope.setting;
        setting.files = setting.files || [];
        setting.files.push({ title: fileGroupTitle, fileStorePaths: [{type:'static'}] });
        fileGroupTitle = '';
        this.fileIndex = setting.files.length - 1;
    }
}

export default {
    bindings: {},
    require: {},
    controller: deviceDetailsSettingsController,
    template: componentTemplate
};