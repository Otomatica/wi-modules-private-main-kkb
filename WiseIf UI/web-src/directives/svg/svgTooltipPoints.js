import angular from 'angular';

svgTooltipSerialChart.$inject = ['$compile', '$parse'];
function svgTooltipSerialChart($compile, $parse) {
    return {
        restrict: 'A',
        scope: false,
        designerInfo: {
            hideFromMenu: true
        },
        link : function ($scope, $element, $attrs) {
            //TODO fix string parsing 
            //TODO check & fix console error nested tooltip element
            if(!$attrs.wiSvgTooltipPoints || $attrs.wiSvgTooltipPoints.length < 3) return;
            let points = $attrs.wiSvgTooltipPoints.slice(1).slice(0, -1).split(',');
            let pointTemplates = points.map(point => (`<ma-point-value hide-event-indicator="${$attrs.hideEventIndicator}" label="DEVICE_AND_NAME"  point="${point}"></ma-point-value>`)).join('\n');
            let template = `<wi-svg-tooltip style="height: auto; white-space: pre-line;" md-direction="${$attrs.mdDirection}"> ${pointTemplates} </wi-svg-tooltip>`;
            template = angular.element(template);
            $element.append(template);
            $compile(template)($scope);
        }
    };
}

export default svgTooltipSerialChart;