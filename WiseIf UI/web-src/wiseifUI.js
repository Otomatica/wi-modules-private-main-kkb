
import angular from 'angular';


import fullScreenFactory from './services/fullScreen';

import fullScreen from './directives/fullScreen';
import svgPanZoom from './directives/svg/svgPanZoom';
import svgTooltipElement from './directives/svg/svgTooltipElement';
import svgTooltipDirective from './directives/svg/svgTooltipDirective';
import svgTooltipChart from './directives/svg/svgTooltipChart';
import svgTooltipPoints from './directives/svg/svgTooltipPoints';

import userHome from './components/userHome/userHome';
import ruler from './components/ruler/ruler';
import toolbar from './components/toolbar/toolbar';
import dateBar from './components/dateBar/dateBar';
import reorder from './components/reorder/reorder';
import rollupCheck from './components/rollupCheck/rollupCheck';
import tooltipChart from './components/tooltipCharts/tooltipChart';
import importHelper from './components/importHelper/importHelper';
import relationGraph from './components/relationGraph/relationGraph';

import numKey from './filters/numKey';
import toArray from './filters/toArray';

import './wiseifUI.css';

let wiseifUIModule = angular.module('wiUIComponents', ['maUiApp']);
wiseifUIModule.optionalRequires = ['maDashboardDesigner'];

wiseifUIModule
    .factory('wiFullScreen', fullScreenFactory)

    .directive('wiFullScreen', fullScreen)
    .directive('wiSvg', svgPanZoom)
    .directive('wiSvgTooltip', svgTooltipElement)
    .directive('wiSvgTooltip', svgTooltipDirective)
    .directive('wiSvgTooltipChart', svgTooltipChart)
    .directive('wiSvgTooltipPoints', svgTooltipPoints)

    .component('wiUserHome', userHome)
    .component('wiRuler', ruler)
    .component('wiToolbar', toolbar)
    .component('wiUiDateBar', dateBar)
    .component('wiReorder', reorder)
    .component('wiRollupCheck', rollupCheck)
    .component('wiTooltipChart', tooltipChart)
    .component('wiImportHelper', importHelper)
    .component('wiRelationGraph', relationGraph)

    .filter('wiNumKey', numKey)
    .filter('wiToArray', toArray)
    .config(['$injector', 'maUiMenuProvider', function($injector, maUiMenuProvider) {

         maUiMenuProvider.registerMenuItems([
            {
                name: 'ui.home',
                url: '/home',
                template: '<wi-user-home></wi-user-home>',
                menuIcon: 'home',
                menuTr: 'wiseifUI.userHome',
                menuHidden: false,
                weight: 0,
                params: {
                    noPadding: false,
                    hideFooter: true
                }
            },
            {
                name: 'ui.settings.importHelper',
                url: '/import-helper',
                template: '<wi-import-helper></wi-import-helper>',
                menuIcon: 'import_export',
                menuTr: 'wiseifUI.importHelper',
                permission: ['superadmin'],
                weight: 3006,
                showInUtilities: true,
                utilityClass: true,
                menuHidden: true,
                params: {
                    noPadding: false,
                    hideFooter: true
                }
            }
            /*,
            {
                name: 'ui.settings.topology',
                url: '/topology',
                template: '<wi-relation-graph></wi-relation-graph>',
                menuIcon: 'group_work',
                menuTr: 'wiseifUI.topology',
                permission: ['superadmin'],
                weight: 3007,
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
            }*/
        ]);

        
        if ($injector.has('maDesignerTagInfoProvider')) {
            $injector.get('maDesignerTagInfoProvider').addComponentSection({
                name: 'wiseif-components',
                translation: 'wiseifUI.components',
                filter: {
                    moduleName: 'wiUIComponents'
                },
                strictFilter: true
            }, 'wiseif-components');
        }
        
    }])
    .config(['$httpProvider', function($httpProvider) {
        var interceptor = ['$q', function($q) {
            return {
                response: function(result) {
                    if(result.config.url == '/rest/latest/modules/list') {
                        result.data.forEach(x => {
                            x.signed = x.signed || x.vendor == "Otomatica";
                            x.licenseType = x.licenseType || (x.vendor == "Otomatica" && 'Unrestricted - WiseIf Store');
                        });
                    }
                    return result;
                }
            };
        }];

        $httpProvider.interceptors.push(interceptor);
    }])
    .config(['$qProvider', 'maTemplateHooksProvider', '$injector', function ($qProvider, maTemplateHooksProvider, $injector) {
        $qProvider.errorOnUnhandledRejections(false);

        maTemplateHooksProvider.addHook('userActions', 
        `<md-menu md-position-mode="target-right target">
            <md-button class="md-icon-button" ng-click="$mdMenu.open($event)">
                <md-tooltip ma-tr="wiseifUI.quickLinks"></md-tooltip>
                <md-icon>star_outline</md-icon>
            </md-button>
            <md-menu-content width="3">
                <md-menu-item>
                    <md-button ui-sref="ui.home">
                        <div layout="row" flex layout-align="start center" layout-fill>
                            <md-icon>home</md-icon>
                            <p flex ma-tr="wiseifUI.userHome"></p>
                        </div>
                    </md-button>
                </md-menu-item>`+

                `<md-menu-item>
                    <md-button ui-sref="ui.overview" ng-class="{'md-primary': $state.current.name == 'ui.overview'}">
                        <div layout="row" flex layout-align="start center" layout-fill>
                            <md-icon>account_tree</md-icon>
                            <p flex ma-tr="overview.title"></p>
                        </div>
                    </md-button>
                </md-menu-item>`+
                
                `<md-menu-item>
                    <md-button ui-sref="ui.deviceDetails" ng-class="{'md-primary': $state.current.name == 'ui.deviceDetails'}">
                        <div layout="row" flex layout-align="start center" layout-fill>
                            <md-icon>important_devices</md-icon>
                            <p flex ma-tr="deviceDetails.title"></p>
                        </div>
                    </md-button>
                </md-menu-item>`+
                
                `<md-menu-item>
                    <md-button ui-sref="ui.pointList" ng-class="{'md-primary': $state.current.name == 'ui.pointList'}">
                        <div layout="row" flex layout-align="start center" layout-fill>
                            <md-icon>vertical_split</md-icon>
                            <p flex ma-tr="pointList.title"></p>
                        </div>
                    </md-button>
                </md-menu-item>`+

                `<md-menu-item>
                    <md-button ui-sref="ui.dataPointDetails" ng-class="{'md-primary': $state.current.name == 'ui.dataPointDetails'}">
                        <div layout="row" flex layout-align="start center" layout-fill>
                            <md-icon>timeline</md-icon>
                            <p flex ma-tr="ui.app.dataPointDetails"></p>
                        </div>
                    </md-button>
                </md-menu-item>

                <md-menu-item>
                    <md-button ui-sref="ui.events" ng-class="{'md-primary': $state.current.name == 'ui.events'}">
                        <div layout="row" flex layout-align="start center" layout-fill>
                            <md-icon>alarm</md-icon>
                            <p flex ma-tr="ui.app.events"></p>
                        </div>
                    </md-button>
                </md-menu-item>

            </md-menu-content>
        </md-menu>
        <md-button class="md-icon-button md-accent" ng-if="!mangoWatchdog.apiUp">
            <md-icon>wifi_off</md-icon>
            <md-tooltip ma-tr="login.ui.app.apiDown"></md-tooltip>
        </md-button>
        <md-button class="md-icon-button" ng-click="enableFullScreen()" ng-if="stateParams.fullScreen">
            <md-icon>fullscreen</md-icon>
            <md-tooltip ma-tr="wiseifUI.fullscreen"></md-tooltip>
        </md-button>`);

    }])
    .run(['$rootScope', '$mdEditDialog', 'maTranslate', 'MA_DATE_FORMATS', 'maStatsDialog', 'maSetPointDialog', '$injector',
        ($rootScope, $mdEditDialog, maTranslate, mangoDateFormats, maStatsDialog, maSetPointDialog, $injector) => {

        $rootScope.$on('$stateChangeSuccess', ( event, to, toParams, from, fromParams ) => {
            !toParams.fullScreen && ($rootScope.fullScreen = false);
            if($rootScope.maUiServerInfo.postLoginData) {
                $rootScope.maUiServerInfo.postLoginData.vendor = 'Otomatica';
                $rootScope.maUiServerInfo.postLoginData.vendorUrl = 'https://www.linkedin.com/company/otomatica/';
            }
        });

        $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl, newState, oldState) {
            let $location = $injector.get('$location');
            $rootScope.lastUrl = '/ui' + $location.$$url;
        });

        $rootScope.mangoDateFormats = mangoDateFormats;
        
        $rootScope.uiSettings.titleSuffix = 'WiseIf';
        $rootScope.uiSettings.pwaAutomaticNamePrefix = 'WiseIf'

        $rootScope.popupPoint = (event, point, type) => {
            let copyPoint = angular.copy(point);
            maStatsDialog.show(event, copyPoint, type || 'chart');
        }

        $rootScope.editPoint = (event, point, step) => {
            if(!point.pointLocator.settable) return;
            //let copyPoint = angular.copy(point);
            maSetPointDialog.show(event, point, step);
        }

        $rootScope.cellEdit = (event, obj, prop , translation, type, validators, callback, binding, parameters) => {
            $mdEditDialog.small({
                type: type || 'text',
                modelValue: obj[prop],
                placeholder: translation && maTranslate.trSync(translation),
                save: function (input) {
                    obj[prop] = input.$modelValue;
                    if(obj[prop] === '') delete obj[prop];
                    callback && callback.apply(binding, parameters)
                },
                targetEvent: event,
                validators: validators
            });
        }

        $rootScope.fullScreen = false;
        $rootScope.enableFullScreen = () => $rootScope.fullScreen = true;
        
        $rootScope.$watch( () => $injector.modules.maDashboardDesignerComponents, module => {
            if(!module) return;
            let component = module._invokeQueue.find(x => x[2][0] == "maDesignerAttributeEditor")[2][1];

            //replace pointXid label attr (label="")
            component.template = component.template.replace(
                `label="{{'ui.components.dataPointXid' | maTr}}"`, 
                `label="{{$ctrl.attr.label || ($ctrl.attr.nameTr || 'ui.components.dataPointXid' | maTr)}}"`
            );

            //replace ng-bind="$ctrl.attributeName" to ng-bind="$ctrl.attr.label || $ctrl.attributeName" 
            //for label and span elements
            component.template = component.template.replace(/\$ctrl.attributeName/g, "$ctrl.attr.label || $ctrl.attributeName");
        });

    }]);

export default wiseifUIModule;