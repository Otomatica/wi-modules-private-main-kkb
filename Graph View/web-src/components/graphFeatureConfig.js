
import componentTemplate from './graphFeatureConfig.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'wiGraphView', 'maUiSettings', '$mdColors']);
class graphFeatureConfigController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, wiGraphView, maUiSettings, $mdColors) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.wiGraphView = wiGraphView;

        this.colors = [
            $mdColors.getThemeColor(maUiSettings.activeTheme+'-primary'),
            $mdColors.getThemeColor(maUiSettings.activeTheme+'-accent'),
            $mdColors.getThemeColor(maUiSettings.activeTheme+'-warn')
        ];
    }

    $onInit() {

    }

    updateIcon() {
        let icon = this.wiGraphView.createIcon(this.$scope.layer.config.icon);
        this.$scope.layer.setIcon(icon);
    }

    updateHeatMap() {
        let index = this.$scope.layer.config.data.heatMapIndex;
        let color = index != undefined  ? this.colors[index] : 'white';
        this.$scope.layer.setStyle({color: color});
    }

    displayTypeChanged() {
        delete this.$scope.layer.config.data;
    }

    hideValueChanged() {
        if(!isNaN(this.$scope.layer.config.data.hideValue)) return;
        delete this.$scope.layer.config.data.hideValue;
    }

    pointChanged(point) {
        this.$scope.layer.config.data = this.$scope.layer.config.data || {};

        if(point && point.xid == this.$scope.layer.config.data.pointXid) return;
        if(point && point.xid)
            this.$scope.layer.config.data.pointXid = point.xid;
        else 
            delete this.$scope.layer.config.data.pointXid;

        delete this.$scope.layer.config.data.hideValue;
    }

    eventTypeChanged() {
        delete this.$scope.layer.config.data.eventData;
    }

    permanentChanged() {
        if(this.$scope.layer.config.data.permanent) return;
        delete this.$scope.layer.config.data.permanent;
        if(!Object.keys(this.$scope.layer.config.data).length) delete this.$scope.layer.config.data;
    }

    eventPointChanged(point) {
        this.$scope.layer.config.data.eventData = this.$scope.layer.config.data.eventData || {};

        if(point && point.xid == this.$scope.layer.config.data.eventData.pointXid) return;
        if(point && point.xid)
            this.$scope.layer.config.data.eventData.pointXid = point.xid;
        else 
            delete this.$scope.layer.config.data.eventData.pointXid;

        delete this.$scope.layer.config.data.eventData.detectorXid;
    }

    detetorChanged() {
        if(this.$scope.layer.config.data.eventData.detectorXid) return;
        delete this.$scope.layer.config.data.eventData.detectorXid;
    }

    tagKeyChanged() {
        delete this.$scope.layer.config.data.value
    }

}

export default {
    bindings: {},
    require: {},
    controller: graphFeatureConfigController,
    template: componentTemplate
};