svgTooltipElement.$inject = ['$compile'];
function svgTooltipElement($compile) {

    function toHtmlNs(element) {
        if (element.outerHTML) {
            return angular.element(element.outerHTML);
        }

        if (element.nodeType === 3) { // text node
            return angular.element('<span>' + element.nodeValue + '</span>');
        }

        // else we do like IE
        var tpl = new XMLSerializer().serializeToString(element).replace(/(\s)xmlns=".*?"\s/, '$1');
        tpl = angular.element(tpl);

        if (element.innerHTML) {
            tpl.append(angular.element(element.innerHTML));
        }
        return tpl;
    }

    return {
        scope: false,
        restrict: 'E',
        transclude: 'element',
        designerInfo: {
            hideFromMenu: true,
        },
        link: function(scope, el, attr, dummy, $tfn) {
            $tfn(scope, function(cloned) {
                // we get a single entry, tranclusion is 'element'
                var contents = toHtmlNs(cloned[0]).contents();
                var tooltip = angular.element('<md-tooltip></md-tooltip>').append(contents);
                angular.forEach(attr.$attr, function(name, key) { tooltip.attr(name, attr[key]); });
                el.parent().append(tooltip);
                $compile(tooltip)(scope);
                cloned.remove();
            }, el.parent());
            el.remove(); 
        },
    };
}

export default svgTooltipElement;