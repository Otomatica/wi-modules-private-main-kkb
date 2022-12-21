class TileMapImageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', 'wiGraphView']; }
    
    constructor($scope, $element, $transclude, wiGraphView) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        this.wiGraphView = wiGraphView;
        
        this.mapCtrl = $scope.$mapCtrl;
        window.L = window.L || this.mapCtrl.leaflet;
    }

    $onInit() {
        //todo create custom zoom control
        //this.createCustomZoom();
    }
    
    $onChanges(changes) {
        this.initOverlay();
    }
    
    $onDestroy() {
        this.imageLayer.remove();
    }

    initOverlay() {
        this.ratio = 0;
        this.imageLayer && this.imageLayer.remove();
        this.mapCtrl.map.options.zoomSnap = 0.1;
        this.mapCtrl.map.options.zoomDelta = 0.1;
        this.imageLayer = this.mapCtrl.leaflet.imageOverlay(this.src, [[0, 0], [-1, this.ratio]], {zIndex: 0});
        this.imageLayer.addTo(this.mapCtrl.map);
        this.imageLayer.on('load', (event) => {
            //setAttribution 
            let attributionTemplate = this.wiGraphView.getAttribution();
            if(this.showDimension) attributionTemplate = `${event.srcElement.naturalWidth} x ${event.srcElement.naturalHeight} &nbsp` + attributionTemplate;

            let attributions = this.mapCtrl.map.attributionControl._attributions;
            Object.keys(attributions).forEach(x => delete attributions[x]);
            this.mapCtrl.map.attributionControl.addAttribution(`<span class="wi-attribution">${attributionTemplate}</span>`);

            //set imageBounds
            this.ratio = event.srcElement.naturalWidth / event.srcElement.naturalHeight;
            this.resetZoom();
        });
    }

    resetZoom(animate = false) {
        if(this.$scope.$$destroyed) return;
        let imageBounds = [[0, 0], [-1, this.ratio]];
        this.imageLayer.setBounds(imageBounds);

        //set zoom & view
        let zoom = this.mapCtrl.map.getBoundsZoom(imageBounds);
        this.mapCtrl.map.setView([-0.5, this.ratio/2], zoom, {animate:animate});
        this.mapCtrl.map.setMinZoom(zoom - 1);
        this.mapCtrl.map.setMaxZoom(zoom + 6);
    }

    createCustomZoom() {
        let self = this;
        let extendedZoomControl = L.Control.Zoom.extend({

            options: {
                position: 'topleft',
                zoomInText: '+',
                zoomInTitle: 'Zoom in',
                zoomOutText: '&#x2212;',
                zoomOutTitle: 'Zoom out',
                zoomResetText: '&#8634;',
                zoomResetTitle: 'Zoom reset'
            },

            onAdd: function (map) {
                map.zoomControl.remove();
                var zoomName = 'leaflet-control-zoom',
                    container = L.DomUtil.create('div', zoomName + ' leaflet-bar'),
                    options = this.options;

                this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
                        zoomName + '-in',  container, this._zoomIn);
                this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
                        zoomName + '-out', container, this._zoomOut);
                this._zoomResetButton = this._createButton(options.zoomResetText, options.zoomResetTitle,
                        zoomName + '-reset', container, this._zoomReset);

                this._updateDisabled();
                map.on('zoomend zoomlevelschange', this._updateDisabled, this);

                return container;
            },

            onRemove: function (map) {
                map.off('zoomend zoomlevelschange', this._updateDisabled, this);
            },

            disable: function () {
                this._disabled = true;
                this._updateDisabled();
                return this;
            },

            enable: function () {
                this._disabled = false;
                this._updateDisabled();
                return this;
            },

            _zoomIn: function (e) {
                if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
                    this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
                }
            },

            _zoomOut: function (e) {
                if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
                    this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
                }
            },

            _zoomReset: function(e) {
                self.resetZoom(true);
            },

            _createButton: function (html, title, className, container, fn) {
                var link = L.DomUtil.create('a', className, container);
                link.innerHTML = html;
                link.href = '#';
                link.title = title;

                /*
                 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
                 */
                link.setAttribute('role', 'button');
                link.setAttribute('aria-label', title);

                L.DomEvent.disableClickPropagation(link);
                L.DomEvent.on(link, 'click', L.DomEvent.stop);
                L.DomEvent.on(link, 'click', fn, this);
                L.DomEvent.on(link, 'click', this._refocusOnMap, this);

                return link;
            },

            _updateDisabled: function () {
                var map = this._map,
                    className = 'leaflet-disabled';

                L.DomUtil.removeClass(this._zoomInButton, className);
                L.DomUtil.removeClass(this._zoomOutButton, className);
                L.DomUtil.removeClass(this._zoomResetButton, className);

                if (this._disabled || map._zoom === map.getMinZoom()) {
                    L.DomUtil.addClass(this._zoomOutButton, className);
                }
                if (this._disabled || map._zoom === map.getMaxZoom()) {
                    L.DomUtil.addClass(this._zoomInButton, className);
                }
            }
        });

        this.extendedZoom = new extendedZoomControl({ position: 'topleft'});
        this.extendedZoom.addTo(this.mapCtrl.map);
    }
}

function tileMapImageDirective() {
    return {
        scope: false,
        bindToController: {
            src: '@?',
            showDimension: '<?'
        },
        designerInfo: {
            hideFromMenu: true
        },
        transclude: 'element',
        controller: TileMapImageController
    };
}

export default tileMapImageDirective;