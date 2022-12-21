import angular from 'angular';

svgTooltipDirective.$inject = ['$compile'];
function svgTooltipDirective($compile) {
    return {
        restrict: 'A',
        scope: false,
        designerInfo: {
            hideFromMenu: true
        },
        link : function ($scope, $element, $attrs) {
            if(!$attrs.wiSvgTooltip) return;
            let template = angular.element(`<wi-svg-tooltip md-direction="${$attrs.mdDirection}" ng-bind="${$attrs.wiSvgTooltip}"></wi-svg-tooltip>`);
            $element.append(template);
            $compile(template)($scope);
        }
    };
}

export default svgTooltipDirective;