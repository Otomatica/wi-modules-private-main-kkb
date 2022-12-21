
import angular from 'angular';
import pointList from './components/pointList';
import pointListService from './services/pointList';
import eventsService from './services/events';
import pointListSettings from './components/settings/pointListSettings';
import pointListTable from './components/pointListTable/pointListTable';
import detectorListTable from './components/detectorListTable/detectorListTable';
import eventTable from './components/eventTable/eventTable';
import noteTable from './components/noteTable/noteTable';
import historyTable from './components/historyTable/historyTable';
import eventTimeLine from './components/eventTimeLine/eventTimeLine';
import statsTable from './components/statsTable/statsTable';
import serialChart from './components/chart/serialChart';
import stateChart from './components/chart/stateChart';
import dailyChart from './components/chart/dailyChart';
import activeEvents from './components/activeEvents/activeEvents'
import activeEventsDisplay from './components/activeEvents/activeEventsDisplay'
import singleEventsDisplay from './components/activeEvents/singleEventsDisplay'

import detectorView from './override/detectorView.html';
import detectorQuery from './directives/detectorQuery';
import noteQuery from './directives/noteQuery';
import eventQuery from './directives/eventQuery';
import pointQuery from './directives/pointQuery';
import pointValue from './directives/pointValue';

import userNotesSocket from './services/userNotesSocket';

import './pointList.css';

export default angular.module('wiPointList', ['maUiApp'])
    .directive('wiDetectorQuery', detectorQuery)
    .directive('wiNoteQuery', noteQuery)
    .directive('wiEventQuery', eventQuery)
    .directive('wiPointQuery', pointQuery)
    .directive('wiPointValue', pointValue)
    
    .component('wiPointList', pointList)
    .component('wiPointListSettings', pointListSettings)
    .component('wiPointListTable', pointListTable)
    .component('wiDetectorListTable', detectorListTable)
    .component('wiEventTable', eventTable)
    .component('wiNoteTable', noteTable)
    .component('wiHistoryTable', historyTable)
    .component('wiEventTimeLine', eventTimeLine)
    .component('wiStatsTable', statsTable)
    .component('wiSerialChart', serialChart)
    .component('wiStateChart', stateChart)
    .component('wiDailyChart', dailyChart)
    .component('wiActiveEvents', activeEvents)
    .component('wiActiveEventsDisplay', activeEventsDisplay)
    .component('wiSingleEventsDisplay', singleEventsDisplay)
    
    .factory('wiPointList', pointListService)
    .factory('wiEvents', eventsService)
    .factory('wiUserNotesSocket', userNotesSocket)
    .config(['maUiMenuProvider', 'maSystemSettingsProvider', function(maUiMenuProvider, maSystemSettingsProvider) {

        maSystemSettingsProvider.addAuditAlarmLevelSetting({
            key: "auditEventAlarmLevel.POINT_LIST",
            translation: "event.audit.pointList"
        });

        maUiMenuProvider.registerMenuItems([
            {
                name: 'ui.pointList',
                url: '/point-list',
                template: '<wi-point-list></wi-point-list>',
                menuIcon: 'vertical_split',
                menuTr: 'pointList.title',
                menuHidden: false,
                weight: 3,
                params: {
                    noPadding: false,
                    hideFooter: true,
                    dateBar: {
                        rollupControls: true
                    }
                }
            },
            {
                name: 'ui.settings.pointListSettings',
                url: '/point-list',
                template: '<wi-point-list-settings></wi-point-list-settings>',
                menuIcon: 'vertical_split',
                menuTr: 'pointList.title',
                permission: ['superadmin'],
                weight: 3002,
                menuHidden: true,
                showInUtilities: true,
                utilityClass: true,
                params: {
                    noPadding: false,
                    hideFooter: true,
                    dateBar: {
                        rollupControls: true
                    }
                }
            },
            {
                name: 'ui.settings.eventDetector',
                url: '/event-detector',
                template: detectorView,
                menuIcon: 'find_in_page',
                menuTr: 'ui.app.eventDetectors',
                permission: ['superadmin'],
                weight: 3001,
                menuHidden: true,
                params: {
                    noPadding: false,
                    hideFooter: true,
                    dateBar: {
                        rollupControls: true
                    }
                }
            }
        ]);
        
    }])
    .run(['maPoint', '$rootScope', 'maEvents', '$timeout', function(maPoint, $rootScope, maEvents, $timeout) {

        let component = angular.module('ngMango')._invokeQueue.find(x => x[2][0] == "maEventDetectorEditor")[2][1];
        let index = component.template.lastIndexOf('</md-tab>') + 9;
        let firstPart = component.template.substring(0, index);
        let secondPart = component.template.substring(index);
        let parametersTab =`
        <md-tab>
            <md-tab-label>
                <span ma-tr="ui.app.parameters"></span>
            </md-tab-label>
            <md-tab-body>
                <ma-ace-editor style="height: 226px;" mode="json" name="data" ng-model="$ctrl.eventDetector.data" ng-model-options="{debounce: 500}" ma-json-model ma-json-model-pretty="4"></ma-ace-editor>
                <div ng-if="$ctrl.form.data.$error.jsonParseError" class="ma-error-text" ng-bind="$ctrl.form.data.jsonParseError"></div>
            </md-tab-body>
        </md-tab>`;
        component.template = firstPart.concat(parametersTab, secondPart);

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
                    `<md-button class="ma-redirect md-raised md-primary" layout="row">
                        <ma-point-value point-xid="internal_mango_num_event_detectors"></ma-point-value>
                        <div ma-tr="ui.app.eventDetectors"></div>
                    </md-button>`, 
                    `<md-button class="ma-redirect md-raised md-primary md-hue-3" layout="row" ui-sref="ui.settings.eventDetector">
                        <ma-point-value point-xid="internal_mango_num_event_detectors"></ma-point-value>
                        <div ma-tr="ui.app.eventDetectors" flex></div>
                        <md-icon>subdirectory_arrow_right</md-icon>
                    </md-button>`);

                homePageComponent.template = homePageComponent.template.replace(
                `<md-button md-no-ink class="ma-info-card-button ma-hover">
                    <div class="ma-content">
                        <ma-point-value class="ma-button-value" point-xid="internal_mango_num_mailing_lists"></ma-point-value>
                        <div class="ma-value-label" ma-tr="ui.app.mailingLists"></div>
                    </div>
                </md-button>`, 
                `<md-button md-no-ink class="ma-info-card-button ma-hover" ui-sref="ui.settings.mailingList">
                    <div class="ma-content">
                        <ma-point-value class="ma-button-value" point-xid="internal_mango_num_mailing_lists"></ma-point-value>
                        <div class="ma-value-label" ma-tr="ui.app.mailingLists"></div>
                    </div>
                </md-button>`);

                homePageComponent.template = homePageComponent.template.replace(
                    `utilityMenuItems track by item.name`, 
                    `utilityMenuItems | filter: {name:'!ui.settings.autoLoginSettings'} | filter: {name: '!ui.settings.importExport'} | orderBy: ['weight', 'name'] track by item.name`
                );

                homePageComponent.template = homePageComponent.template.replace(
                    `<md-button class="md-raised md-primary ma-redirect" layout="row" ui-sref="{{item.name}}">`, 
                    `<md-button class="md-raised ma-redirect" ng-class="item.utilityClass && 'md-primary md-hue-3' || 'md-primary'" layout="row" ui-sref="{{item.name}}">`
                );
            });
        };

        /*TODO use new event socket to get/subscrive active events*/
        $rootScope.selectedPoints = [];
        $rootScope.pointQueries = {}; //cached pointIds
        $rootScope.firstPoints = {}; //cached firstPoints
        $rootScope.activeEvents = []; //global active events

        maPoint.notificationManager.subscribe((event, mangoPoint) => {
            //reset cached values
            $rootScope.pointQueries = {};
            $rootScope.firstPoints = {};
        }, $rootScope, ['create', 'update', 'delete']);

        $rootScope.registerActiveEvents = () => {
            return maEvents.notificationManager.subscribe((event, mangoEvent) => {
                if(mangoEvent.id < 0) return;
                if(mangoEvent.eventType.eventType != 'DATA_POINT') return;
                const eventIndex = $rootScope.activeEvents.findIndex(e => e.id === mangoEvent.id);
                if(event.name === 'RETURN_TO_NORMAL' || event.name === 'DEACTIVATED') {
                    if (eventIndex >= 0) {
                        $rootScope.activeEvents.splice(eventIndex, 1);
                    }
                }
                else if(event.name === 'RAISED') {
                    if (eventIndex < 0) {
                        $rootScope.activeEvents.push(mangoEvent);
                    }
                }
                else if(event.name === 'ACKNOWLEDGED') {
                    if (eventIndex >= 0) {
                        $rootScope.activeEvents[eventIndex] = mangoEvent;
                    }
                }
            }, $rootScope, ['RAISED', 'RETURN_TO_NORMAL', 'DEACTIVATED', 'ACKNOWLEDGED']);
        }

        $rootScope.getActiveEvents = () => {
             maEvents.buildQuery()
                .eq('active', true)
                .eq('eventType', 'DATA_POINT')
                .limit(1000000)
                .query()
                .then(events => $rootScope.activeEvents = events);
        }

        $rootScope.$maSubscribe('maWatchdog/LOGGED_IN', (event, maWatchdog) => {
            $rootScope.unRegisterActiveEvents && $rootScope.unRegisterActiveEvents();
            $rootScope.unRegisterActiveEvents = $rootScope.registerActiveEvents();
            $timeout(() => $rootScope.getActiveEvents() , 1000);
        });

    }]);