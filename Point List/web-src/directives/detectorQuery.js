
detectorQuery.$inject = ['maEventDetector'];
function detectorQuery(EventDetector) {
    return {
        scope: {
            refresh: '<?',
            alarmLevel: '<?',
            detectorTypes: '<?',
            pointIds: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            detectors: '=?',
            promise: '=?'
        },
        designerInfo: {
            translation: 'ui.components.detectorQuery',
            icon: 'find_in_page',
            category: 'pointValuesAndCharts'
        },
        link: function ($scope, $element, attr) {
            $scope.$watch(function() {
                return {
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort,
                    pointIds: $scope.pointIds,
                    detectorTypes: $scope.detectorTypes,
                    refresh: $scope.refresh,
                    alarmLevel: $scope.alarmLevel
                };
            }, function(value) {
                const query = EventDetector.buildQuery();
                query.eq('detectorSourceType', 'DATA_POINT');
                value.pointIds && value.pointIds.length && query.in('dataPointId', value.pointIds);
                value.detectorTypes && value.detectorTypes.length && query.in('typeName', value.detectorTypes);
                value.sort && query.sort(value.sort);
                if(value.limit || value.limit == 0) {
                    if(value.start) query.limit(value.limit, value.start);
                    else query.limit(value.limit);
                }

                $scope.promise = query.query();
                $scope.promise.then(data => {
                    if(value.alarmLevel != 'any') {
                        $scope.detectors = data.filter(x => x.alarmLevel == value.alarmLevel);
                        return $scope.detectors.$total = $scope.detectors.length;
                    }
                    $scope.detectors = data;
                });

            }, true);
        }
    };
}

export default detectorQuery;