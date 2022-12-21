
deviceView.$inject = ['$parse', '$compile'];
function deviceView($parse, $compile) {
    return {
        controller: ['$scope', '$element', function ($scope, $element) {
            let name = $parse($element.attr("name"))($scope);
            let binding = $parse($element.attr("binding-tag"))($scope);
            let points = $parse($element.attr("points"))($scope) || [];
            let poinstMap = Object.keys(points).map(x => x+'="'+points[x].xid+'"').join(' ');
            let elem = '<' + name + ' binding-tag="' + binding + '" binding-points="points" '+ poinstMap +'></' + name + '>';
            let component = $compile(elem)($scope);
            $element.append(component);
        }]
    };
}

export default deviceView;