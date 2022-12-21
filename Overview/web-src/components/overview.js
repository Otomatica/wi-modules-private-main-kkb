
import componentTemplate from './overview.html';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'wiPointList', '$timeout', 'maPoint', 'maFileStore', '$mdSidenav']);
class overviewController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, wiPointList, $timeout, maPoint, maFileStore, $mdSidenav) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.wiPointList = wiPointList;
        this.$timeout = $timeout;
        this.maPoint = maPoint;
        this.maFileStore = maFileStore;
        this.$mdSidenav = $mdSidenav;

        this.$scope.$watch('$root.fullScreen', (nV, oV) => {
            if(nV == oV) return;
            let filterComp = $element[0].querySelector('wi-overview-filter');
            let container = $element[0].querySelector( '#' + (nV ? 'sidenav' : 'default') + '-filter-container');
            let contains = container.querySelector('wi-overview-filter');
            !contains && container && filterComp && container.appendChild(filterComp);
            !nV && this.$mdSidenav('overviewFilter').close();
        });
    }

    $onInit() {
        this.$scope.$watchGroup(['$ctrl.$state.params.key', '$ctrl.$state.params.value', 'setting'], this.getFirstPoint.bind(this, null));
    }

    getFirstPoint(oldErr) {
        this.tabIndex = 0; //open graphicTab
        this.firstPoint = null;
        if(!this.$scope.setting) return;
        let query = 'eq(tags.'+this.$state.params.key+','+this.$state.params.value+')&limit(1)';
        let context = this.$scope.setting.tags.find(x => x.key == this.$state.params.key);
        if(!context) return this.getDefaultFirstPoint();

        this.$scope.currentSetting = context;
        context.defaultTagValues = [{[this.$state.params.key] : this.$state.params.value}];
        context.rootRestriction = {[this.$state.params.key] : this.$state.params.value};
        

        let firstPoints = this.$scope.$root.firstPoints;
        if(firstPoints[this.$state.params.key] && firstPoints[this.$state.params.key][this.$state.params.value]) {
            this.firstPoint = firstPoints[this.$state.params.key][this.$state.params.value];
            this.createWathcList();
            this.getFiles();
            return;
        }

        this.maPoint.query({rqlQuery:query}).$promise.then( e => {
            this.firstPoint = e.length && e[0];
            if(this.firstPoint) {
                firstPoints[this.$state.params.key] = firstPoints[this.$state.params.key] || {};
                firstPoints[this.$state.params.key][this.$state.params.value] = this.firstPoint;
                this.createWathcList();
                this.getFiles();
            }
            else if(!oldErr) this.getDefaultFirstPoint();
        }, err => {
            if(!oldErr) this.getDefaultFirstPoint();
        });
    }

    getDefaultFirstPoint() {
        //if debounce on root
        //this.disableOverview = (this.$scope.setting.tags[0].key == this.$state.params.key && this.$scope.setting.defaultValue == this.$state.params.value);
        this.$scope.$root.navigate(this.$scope.setting.tags[0].key, this.$scope.setting.defaultValue);        
    }

    createWathcList() {
        this.pointList = new this.wiPointList();
        this.pointList.context = this.$scope.setting.tags.find(x => x.key == this.$state.params.key);
        this.watchList = this.wiPointList.createWathcList(this.pointList);

        this.tabIndex == 3 && this.getDevices();
    }

    getDevices() {
        this.wiPointList.getDevices(this.pointList).then(e => this.devices = e);
    }

    getFiles() {
        if(!this.firstPoint || this.tabIndex != 5) return;
        let files = this.$scope.currentSetting.files;
        files && files.forEach(f => {
            f.files = [];
            let filePaths = f.fileStorePaths || [];
            let paths = filePaths.map(x => this.getPath(x));
            paths.unshift('default');
            this.maFileStore.listFiles(paths).then(
                e => f.files = e.filter( x => !x.directory),
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
    bindings: {},
    require: {

    },
    controller: overviewController,
    template: componentTemplate
};