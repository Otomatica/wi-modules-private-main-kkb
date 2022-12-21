
import componentTemplate from './deviceDetailsView.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maPoint', 'maFileStore', '$timeout']);
class deviceDetailsViewController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maPoint, maFileStore, $timeout) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.maPoint = maPoint;
        this.maFileStore = maFileStore;
        this.$timeout = $timeout;
    }

    $onInit() {
        this.$scope.$watch('setting', (nV, oV) => {
            if(nV == oV) return;
            this.getPoints();
        });
        this.$scope.$watch('$ctrl.device', (nV, oV) => {
            if(nV == oV) return;
            this.getPoints();
        });
        this.$scope.$watchGroup(['$ctrl.devices'], () => this.handleChange(), true);
    }

    handleChange() {
        if(!this.devices || this.devices.length == 0 || !this.devices[0]) return this.device = undefined;
        let newDevices = this.devices.filter(x => x.includes(this.filter || ''));
        let found = newDevices.find(x => x == this.device);
        if(found) return;
        if(newDevices.length == 1) return this.device = newDevices[0];
        if(newDevices.length == 0) return this.device = undefined;
    }

    getPoints() {
        this.graphIndex = -1;
        this.device && (this.deviceIndex = this.devices.indexOf(this.device));
        if(!this.$scope.setting || !this.device) return;
        this.$scope.points = [];
        this.pointIds = [];
        this.files = [];
        this.firstPoint = null;
        let query = 'eq(deviceName,' + this.device + ')';
        this.$scope.pointPromise = this.maPoint.objQuery({query:query}).$promise;
        this.device && this.$scope.pointPromise.then(e => {
            this.$timeout(() => this.graphIndex = 0, this.dialog ? 500 : 0);
            this.$scope.points = e;
            this.firstPoint = this.$scope.points.length && this.$scope.points[0];
            this.pointIds = this.$scope.points.map(x => x.id);
            this.getFiles();
        });
    }

    getFiles() {
        if(!this.firstPoint || this.tabIndex != 5) return;
        let files = this.$scope.setting.files;
        files && files.forEach(f => {
            f.files = [];
            let filePaths = f.fileStorePaths || [];
            let paths = filePaths.map(x => this.getPath(x));
            paths.unshift('default');
            this.maFileStore.listFiles(paths).then(
                res => f.files = res.filter( x => !x.directory),
                err => {}
            );
        });
    }

    getPath(path) {
        if(path.type == 'static') return path.value;
        if(path.value == 'device') return this.firstPoint.deviceName;
        if(path.value == 'name') return this.firstPoint.name;
        return this.firstPoint.tags[path.value];
    }
}

export default {
    bindings: {
        overviewSetting: '<?',
        devices: '<?',
        device: '=?',
        dialog: '<?',
        tabIndex: '<?'
    },
    require: {},
    controller: deviceDetailsViewController,
    template: componentTemplate
};