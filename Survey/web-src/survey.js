
import angular from 'angular';
import survey from './components/survey/survey';
import surveyCreator from './components/surveyCreator/surveyCreator';
import surveyService from './services/survey';

import './../web/survey-creator.css';
import './../web/modern.css';
import './survey.css';

export default angular.module('wiSurvey', ['maUiApp'])
    .component('wiSurvey', survey)
    .component('wiSurveyCreator', surveyCreator)
    .factory('wiSurvey', surveyService)
    .config(['maUiMenuProvider', function(maUiMenuProvider) {
        maUiMenuProvider.registerMenuItems([
            {
                name: 'ui.settings.surveyCreator',
                url: '/survey-creator',
                template: '<wi-survey-creator></wi-survey-creator>',
                menuIcon: 'assignment',
                menuTr: 'survey.creator',
                permission: 'superadmin',
                weight: 3008,
                menuHidden: true,
                showInUtilities: false,
                params: {
                    noPadding: false,
                    hideFooter: true,
                    dateBar: {
                        rollupControls: true
                    }
                }
            },
            {
                name: 'ui.settings.survey',
                url: '/survey',
                template: '<wi-survey></wi-survey>',
                menuIcon: 'assignment_turned_in',
                menuTr: 'survey.title',
                permission: 'superadmin',
                weight: 3009,
                menuHidden: true,
                showInUtilities: false,
                params: {
                    noPadding: false,
                    hideFooter: true,
                    dateBar: {
                        rollupControls: true
                    }
                }
            },
        ]);
        
    }])
    .run(['$rootScope', function($rootScope) {
                //admin menu override
        let menus = angular.module('maUiApp')._invokeQueue.find(x => x[2][0] == "MA_UI_MENU_ITEMS")[2][1];
        let adminMenu = menus.find(x => x.name == "ui.settings.home");
        let loadAdminHomePage = adminMenu.resolve.loadMyDirectives[1];
        adminMenu.resolve.loadMyDirectives[1] = ($injector) => {
            return loadAdminHomePage($injector).then(() => {
                let adminModule = angular.module("maUiAdminHomePage");
                let homePageComponent = adminModule._invokeQueue.find(x => x[2][0] == "maUiAdminHomePage")[2][1];
                //replace eventDetectorPage
                homePageComponent.template = homePageComponent.template.replace(
                    `<md-card-content flex></md-card-content>`, 
                    `<md-card-content flex>
                        <md-button class="ma-redirect md-raised md-primary md-hue-3" layout="row" ui-sref="ui.settings.surveyCreator">
                            <div ma-tr="survey.creator" flex></div>
                            <md-icon>subdirectory_arrow_right</md-icon>
                        </md-button>
                        <md-button class="ma-redirect md-raised md-primary md-hue-3" layout="row" ui-sref="ui.settings.survey">
                            <div ma-tr="survey.title" flex></div>
                            <md-icon>subdirectory_arrow_right</md-icon>
                        </md-button>
                    </md-card-content>`);
            });
        };

    }]);