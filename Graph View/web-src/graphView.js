
import angular from 'angular';
import graphView from './components/graphView';
import graphViewEditor from './components/graphViewEditor';
import graphFeatureConfig from './components/graphFeatureConfig';
import graphViewSettings from './components/settings/graphView';

import tileMapDraw from './directives/tileMap/tileMapDraw';
import tileMapImage from './directives/tileMap/tileMapImage';
import tileMapShape from './directives/tileMap/tileMapShape';
import tileMapHeatMap from './directives/tileMap/tileMapHeatMap';
import tileMapGeojson from './directives/tileMap/tileMapGeojson';

import tileMapRuler from './directives/tileMap/tileMapRuler';

import graphViewService from './services/graphView';

import './graphView.css';

export default angular.module('wiGraphView', ['maUiApp'])
    .component('wiGraphView', graphView)
    .component('wiGraphViewEditor', graphViewEditor)
    .component('wiGraphFeatureConfig', graphFeatureConfig)
    .component('wiGraphViewSettings', graphViewSettings)

    .directive('wiTileMapDraw', tileMapDraw)
    .directive('wiTileMapImage', tileMapImage)
    .directive('wiTileMapShape', tileMapShape)
    .directive('wiTileMapHeatMap', tileMapHeatMap)
    .directive('wiTileMapGeojson', tileMapGeojson)

    .directive('wiTileMapRuler', tileMapRuler)

    .factory('wiGraphView', graphViewService)
    .config(['maUiMenuProvider', 'maSystemSettingsProvider', function(maUiMenuProvider, maSystemSettingsProvider) {

        maSystemSettingsProvider.addAuditAlarmLevelSetting({
            key: "auditEventAlarmLevel.GRAPH_VIEW",
            translation: "event.audit.graphView"
        });

        maUiMenuProvider.registerMenuItems([
            {
                name: 'ui.settings.graphView',
                url: '/graph-view',
                template: '<wi-graph-view-settings></wi-graph-view-settings>',
                menuIcon: 'photo_size_select_large',
                menuTr: 'graphView.title',
                permission: ['superadmin'],
                weight: 3005,
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
            }
        ]);
        
    }]);