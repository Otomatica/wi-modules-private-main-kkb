
import angular from 'angular';
import overview from './components/overview';
import overviewFilter from './components/filter/overviewFilter';
import tagHierarchy from './components/tagHierarchy/tagHierarchy'
import overviewSettings from './components/settings/overview';

export default angular.module('wiOverview', ['maUiApp'])
    .component('wiTagHierarchy', tagHierarchy)
    .component('wiOverviewFilter', overviewFilter)
    .component('wiOverview', overview)
    .component('wiOverviewSettings', overviewSettings)
    .config(['maUiMenuProvider', function(maUiMenuProvider) {
        maUiMenuProvider.registerMenuItems([
            {
                name: 'ui.overview',
                url: '/overview?key&value',
                template: '<wi-overview></wi-overview>',
                menuIcon: 'account_tree',
                menuTr: 'overview.title',
                menuHidden: false,
                weight: 1,
                params: {
                    fullScreen: true,
                    noPadding: false,
                    hideFooter: true,
                    dateBar: {
                        rollupControls: true
                    }
                }
            },
            {
                name: 'ui.settings.overviewSettings',
                url: '/overview?key&value',
                template: '<wi-overview-settings></wi-overview-settings>',
                menuIcon: 'account_tree',
                menuTr: 'overview.title',
                permission: ['superadmin'],
                weight: 3004,
                menuHidden: true,
                showInUtilities: true,
                utilityClass: true,
                params: {
                    fullScreen: true,
                    noPadding: false,
                    hideFooter: true,
                    dateBar: {
                        rollupControls: true
                    }
                }
            }
        ]);
        
    }]).run(['$rootScope', '$state', function($rootScope, $state) {

        $rootScope.navigate = (key, value) => {
            $state.params.key = key || $state.params.key;
            $state.params.value = value || $state.params.value;
            let isOverview = $state.is('ui.overview') || $state.is('ui.settings.overviewSettings');
            let device = $state.params.device;
            $state.go(isOverview ? '.' : 'ui.overview', $state.params, {
                location: isOverview ? 'replace' : true,
                notify: !isOverview
            }).then(() => {
                $state.params.device = device;
            });
        }
    }]);