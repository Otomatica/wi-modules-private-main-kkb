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
            //TODO check & fix console error nested tooltip element
            if(!$attrs.wiSvgTooltipChart) return;
            let template = `<wi-svg-tooltip style="height: auto; width: 450px;" md-direction="${$attrs.mdDirection}">
                <wi-tooltip-chart point="${$attrs.wiSvgTooltipChart}"></wi-tooltip-chart>
            </wi-svg-tooltip>`;
            template = angular.element(template);
            $element.append(template);
            $compile(template)($scope);
        }
    };
}

export default svgTooltipSerialChart;