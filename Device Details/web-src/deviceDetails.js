
import angular from 'angular';
import deviceView from './directives/deviceView';
import deviceDetails from './components/deviceDetails';
import deviceDialog from './components/dialog/deviceDialog';
import deviceDetailsView from './components/view/deviceDetailsView';
import deviceDetailsFilter from './components/filter/deviceDetailsFilter';
import deviceDetailsSettings from './components/settings/deviceDetails';
import './deviceDetails.css';

export default angular.module('wiDeviceDetails', ['maUiApp'])
    .directive('wiDeviceView', deviceView)
    .component('wiDeviceDetails', deviceDetails)
    .component('wiDeviceDialog', deviceDialog)
    .component('wiDeviceDetailsView', deviceDetailsView)
    .component('wiDeviceDetailsFilter', deviceDetailsFilter)
    .component('wiDeviceDetailsSettings', deviceDetailsSettings)
    .config(['maUiMenuProvider', function(maUiMenuProvider) {
        maUiMenuProvider.registerMenuItems([
            {
                name: 'ui.deviceDetails',
                url: '/device-details',
                template: '<wi-device-details></wi-device-details>',
                menuIcon: 'important_devices',
                menuTr: 'deviceDetails.title',
                menuHidden: false,
                weight: 2,
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
                name: 'ui.settings.deviceDetailsSettings',
                url: '/device-details',
                template: '<wi-device-details-settings></wi-device-details-settings>',
                menuIcon: 'important_devices',
                menuTr: 'deviceDetails.title',
                permission: ['superadmin'],
                weight: 3003,
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
        
    }])
    .run(['$rootScope', '$state',  function($rootScope, $state) {

        $rootScope.popupDevice = (device, tab) => {
            if(tab == 'events') $state.params.tabIndex = 2;
            $state.params.device = device;
        }

    }]);