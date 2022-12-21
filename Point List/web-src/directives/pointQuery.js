
pointQuery.$inject = ['maPoint'];
function pointQuery(maPoint) {
    const DEFAULT_SORT = ['xid','deviceName', 'name'];

    return {
        scope: {
            filter: '<?',
        	query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            points: '=?',
            promise: '=?'
        },
        designerInfo: {
            translation: 'ui.components.pointQuery',
            icon: 'find_in_page',
            category: 'pointValuesAndCharts',
            hideFromMenu: true,
        },
        link: function ($scope, $element, attr) {
            $scope.$watch(function() {
                return {
                    filter: $scope.filter,
                    query: $scope.query,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort
                };
            }, function(value) {

                if($scope.promiseQuery && !$scope.promiseQuery.$resolved)
                    $scope.promiseQuery.$cancelRequest();

                if(value.query == 'eq(id,0)') {
                    $scope.points = [];
                    $scope.points.$total = 0;
                    return;
                }

                if(value.filter) value.query+='&like(name,*'+value.filter +'*)';
                value.sort = [value.sort,'xid'] || DEFAULT_SORT;
                $scope.promiseQuery = maPoint.objQuery(value);
                $scope.promise = $scope.promiseQuery.$promise;
                let prevTotal = $scope.points && $scope.points.$total || 0;
                $scope.points = [];
                $scope.points.$total = prevTotal;
                $scope.promise.then( points => $scope.points = points);
                
            }, true);
        }
    };
}

export default pointQuery;