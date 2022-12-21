
eventQuery.$inject = ['maRqlBuilder', 'wiEvents', 'maUiDateBar', 'maEvents'];
function eventQuery(maRqlBuilder, wiEvents, maUiDateBar, maEvents) {
    return {
        scope: {
            skipQuery: '<?',
            refresh: '<?',
            autoRefresh: '<?',
            dateFilter: '<?',
            alarmLevel : '<?',
            activeStatus : '<?',
            acknowledged : '<?',
            pointQuery: '<?',
            pointIds: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            events: '=?',
            promise: '=?'
        },
        designerInfo: {
            translation: 'ui.components.eventQuery',
            icon: 'find_in_page',
            category: 'pointValuesAndCharts'
        },
        link: function ($scope, $element, attr) {
            $scope.$on('$destroy', () => {
                if($scope.promiseQuery && !$scope.promiseQuery.$resolved)
                    $scope.promiseQuery.$cancelRequest();
            });

            $scope.$watch(function() {
                return {
                    skipQuery: $scope.skipQuery,
                    refresh: $scope.refresh,
                    dateFilter: $scope.dateFilter,
                    from: $scope.dateFilter && $scope.autoRefresh && maUiDateBar.from,
                    to: $scope.dateFilter && $scope.autoRefresh && maUiDateBar.to,
                    alarmLevel: $scope.alarmLevel,
                    activeStatus: $scope.activeStatus,
                    acknowledged: $scope.acknowledged,
                    pointQuery: $scope.pointQuery,
                    pointIds: $scope.pointIds,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort
                };
            }, function(value) {
                if(!value.pointQuery && !value.pointIds) return;

                if($scope.promiseQuery && !$scope.promiseQuery.$resolved)
                    $scope.promiseQuery.$cancelRequest();

                let eventQuery = 'undefined';
                if(!value.skipQuery) {
                    eventQuery = new maRqlBuilder();
                    eventQuery.eq('eventType', 'DATA_POINT');
                    if(value.acknowledged != 'any') eventQuery.eq('acknowledged', value.acknowledged);
                    if(value.alarmLevel != 'any') eventQuery.eq('alarmLevel', value.alarmLevel);
                    if(value.activeStatus == 'active') eventQuery.eq('active', true);
                    if(value.activeStatus == 'normal') eventQuery.eq('active', false);
                    if(value.activeStatus == 'noRtn') eventQuery.eq('rtnApplicable', false);

                    if(value.dateFilter) {
                        eventQuery.or()
                            .and()
                            .ge('activeTimestamp', maUiDateBar.from.getTime())
                            .lt('activeTimestamp', maUiDateBar.to.getTime())
                        .up()
                            .and()
                            .ge('rtnTimestamp', maUiDateBar.from.getTime())
                            .lt('rtnTimestamp', maUiDateBar.to.getTime())
                        .up()
                            .and()
                            .eq('active', true)
                            .eq('rtnApplicable', true)
                            .lt('activeTimestamp', maUiDateBar.to.getTime());
                    }

                    value.sort && eventQuery.sort(value.sort);
                    if(value.limit || value.limit == 0) {
                        if(value.start) eventQuery.limit(value.limit, value.start);
                        else eventQuery.limit(value.limit);
                    }
                }

                let prevTotal = $scope.events && $scope.events.total || 0;
                $scope.events = { total: prevTotal, items:[], pointIds:[] };

                /*get pointIds from cache*/
                let cacheIds = value.pointQuery && $scope.$root.pointQueries[value.pointQuery];
                if(value.skipQuery && cacheIds) {
                    $scope.events.pointIds = cacheIds;
                    return;
                }

                let postData = {
                    pointsRql: decodeURI(value.pointQuery),
                    eventsRql: eventQuery && eventQuery.toString()
                };
                if(value.pointIds || value.cacheIds) postData.pointIds = value.pointIds || value.cacheIds;

                $scope.promiseQuery = wiEvents.customQuery(postData);
                $scope.promise = $scope.promiseQuery.$promise;
                $scope.promise.then(data => {
                    //cache pointIds
                    value.pointQuery && ($scope.$root.pointQueries[value.pointQuery] = data.pointIds);
                    
                    $scope.events = {
                        items: (data.events.items || []).map( event => new maEvents(event) ),
                        total: data.events.total,
                        pointIds: data.pointIds
                    };
                });

            }, true);
        }
    };
}

export default eventQuery;