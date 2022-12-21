
import angular from 'angular';
import languageSettings from './components/settings/language';
import languageService from './services/language';

export default angular.module('wiLanguage', ['maUiApp'])
    .factory('wiLanguage', languageService)
    .component('wiLanguageSettings', languageSettings)
    .config(['maUiMenuProvider', function(maUiMenuProvider) {
        maUiMenuProvider.registerMenuItems([
            {
                name: 'ui.settings.language',
                url: '/language',
                template: '<wi-language-settings></wi-language-settings>',
                menuIcon: 'language',
                menuTr: 'language.title',
                permission: ['superadmin'],
                weight: 3000,
                menuHidden: false,
                showInUtilities: true,
                utilityClass: true,
                params: {
                    noPadding: false,
                    hideFooter: true
                }
            }
        ]);
    }]);
