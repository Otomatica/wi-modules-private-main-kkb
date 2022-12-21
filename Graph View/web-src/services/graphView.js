
graphViewFactory.$inject = ['maRestResource', '$compile'];
function graphViewFactory(RestResource, $compile) {
    
    const graphViewBaseUrl = '/rest/latest/graph-view';
    const graphViewWebSocketUrl = '/rest/latest/websocket/graph-view';
    const graphViewXidPrefix = 'GV_';

    const getDefaultOptions = () => ({
        blur: 15,
        radius: 25,
        max: 100,
        minOpacity: 0.7,
        gradient: {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }
    });

    const defaultProperties = {
        name: 'New graph view',
        context: { 
            layers: [],
            heatMap: [
                {
                    title: 'Heat Map 1',
                    position: 'topright',
                    enabled: true,
                    icon: 'whatshot',
                    class: 'md-primary',
                    limit: 100,
                    options: getDefaultOptions()
                },
                {
                    title: 'Heat Map 2',
                    position: 'topright',
                    enabled: false,
                    icon: 'pie_chart',
                    class: 'md-accent',
                    limit: 100,
                    options: getDefaultOptions()
                },
                {
                    title: 'Heat Map 3',
                    position: 'topright',
                    enabled: false,
                    icon: 'battery_charging_full',
                    class: 'md-warn',
                    limit: 100,
                    options: getDefaultOptions()
                }
            ]
        }
    };

    class graphViewResource extends RestResource {
        static get defaultProperties() {
            return defaultProperties;
        }
        
        static get baseUrl() {
            return graphViewBaseUrl;
        }
        
        static get webSocketUrl() {
            return graphViewWebSocketUrl;
        }
        
        static get xidPrefix() {
            return graphViewXidPrefix;
        }

        static createIcon(icon, color) {

            let spanStyles = `
                background-color: ${color || 'var(--ma-warn)'};
                width: 2.5rem;
                height: 2.5rem;
                display: block;
                left: -1.5rem;
                top: -1.5rem;
                position: relative;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 1.5px solid var(--ma-foreground-1);
                cursor: pointer`;

            let iconStyles = `
                font-size: 23px;
                height: 22px;
                width: 22px;
                min-height: 22px;
                min-width: 22px;
                transform: rotate(45deg);
                cursor: pointer`;

            return window.L.divIcon({
                className: "wi-div-marker",
                iconAnchor: [0, 20],
                labelAnchor: [-6, 0],
                popupAnchor: [0, -36],
                html: `<span style="${spanStyles}"><md-icon class="material-icons" style="${iconStyles}">${icon}</md-icon></span>`
            });
        }

        static createPointIcon(xid, scope) {
            let template = `<ma-point-value point-xid="${xid}" hide-event-indicator="true" flash-on-change="true" enable-popup="left"></ma-point-value>`;
            let com = $compile(template)(scope.$new());
            return window.L.divIcon({
                className: 'wi-point-marker',
                iconSize: [0, 0],
                iconAnchor: [0, 20],
                html: com[0]
            });
        }

        static getAttribution() {
            return `&copy; ${+new Date().getFullYear()} <a href="https://www.linkedin.com/company/otomatica/" target="_blank">Otomatica</a>`;
        }

    }
    
    return graphViewResource;
}

export default graphViewFactory;