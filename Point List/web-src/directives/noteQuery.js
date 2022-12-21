
noteQuery.$inject = ['maUserNotes'];
function noteQuery(maUserNotes) {
    return {
        scope: {
            refresh: '<?',
            comment: '<?',
            users: '<?',
            points: '<?',
            from: '<?',
            to: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            notes: '=?',
            promise: '=?'
        },
        designerInfo: {
            translation: 'ui.components.noteQuery',
            icon: 'find_in_page',
            category: 'pointValuesAndCharts'
        },
        link: function ($scope, $element, attr) {
            $scope.$watch(function() {
                return {
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort,
                    points: $scope.points,
                    users: $scope.users,
                    refresh: $scope.refresh,
                    comment: $scope.comment,
                    from: $scope.from,
                    to: $scope.to
                };
            }, function(value) {
                const query = maUserNotes.buildQuery();
                query.eq('commentType','POINT');
                value.points && value.points.length && query.in('referenceId', value.points.map(x => x.id));
                (!value.points || !value.points.length) && query.eq('referenceId', -1);
                value.users && value.users.length && query.in('userId', value.users.map(x => x.id));
                value.from && query.ge('timestamp', value.from.getTime());
                value.to && query.lt('timestamp', value.to.getTime());
                value.sort && query.sort(value.sort);
                value.comment && query.like('commentText', '*' + value.comment + '*');

                if(value.limit || value.limit == 0) {
                    if(value.start) query.limit(value.limit, value.start);
                    else query.limit(value.limit);
                }

                $scope.promise = query.query();
                $scope.promise.then(data => $scope.notes = data);
            }, true);
        }
    };
}

export default noteQuery;