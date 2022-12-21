
eventsFactory.$inject = ['$resource'];
function eventsFactory($resource) {
    const Events = $resource('/rest/latest/events', {id: '@id'}, {
        customQuery: {
            method: 'POST',
            url: '/rest/latest/point-events/custom-query'
        }
    });
    return Events;
}

export default eventsFactory;

