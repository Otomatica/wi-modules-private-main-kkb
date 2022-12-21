
import angular from 'angular';
import svgPanZoom from 'svg-pan-zoom';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$window', '$compile', '$timeout']);
class svgPanZoomController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $window, $compile, $timeout) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$window = $window;
        this.$compile = $compile;
        this.$timeout = $timeout;

        this.$scope.$on("$includeContentLoaded", (event, url) => this.onSvgLoad(event, url));
    }

    $onInit() {
        this.$scope.$watch('$root.navLockedOpen', (nV, oV) => this.delayedReset(nV) );
        angular.element(this.$window).on('resize', () => this.panZoomMethod('resize', 'fit', 'resetPan') );    
    }

    delayedReset(navLockedOpen) {
        !navLockedOpen && this.$timeout( () => this.panZoomMethod('resize', 'fit', 'resetPan'), 500);
        navLockedOpen && this.panZoomMethod('resize', 'fit', 'resetPan');
    }

    $onDestroy() {
        angular.element(this.$window).off('resize');
        this.svgElement && svgPanZoom(this.svgElement).destroy();
    }

    panZoomMethod(...args) {
        this.panZoom && args.forEach(arg => this.panZoom[arg]());
    }

    onSvgLoad(event, url) {
        this.svgElement = this.$element[0].querySelector('svg');
        if(!this.svgElement) return;
        this.panZoom = svgPanZoom(this.svgElement, {
            panEnabled: true,
            zoomEnabled: true, 
            zoomScaleSensitivity: 0.2,
            minZoom: 0.5,
            maxZoom: 10,
            dblClickZoomEnabled: true,
            mouseWheelZoomEnabled: true,
            preventMouseEventsDefault: true,
            controlIconsEnabled: false,
            fit: false, 
            center: false,
            contain: true,
        });
    }
}

svg.$inject = ['$document', '$templateCache', 'wiFullScreen'];
function svg($document, $templateCache, wiFullScreen) {
    const SELECTOR_ATTRIBUTE = 'ma-selector';
    const EMPTY_TEMPLATE_URL = '/ngMango/circle.svg';
    const EMPTY_TEMPLATE = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="100" cy="100" r="100"></circle>' +
        '</svg>';

    $templateCache.put(EMPTY_TEMPLATE_URL, EMPTY_TEMPLATE);
    
    return {
        restrict: 'E',
        // needs to be lower priority than ngIncludeFillContentDirective so our link runs first
        priority: -401,
        require: ['wiSvg', 'ngInclude'],
        controller: svgPanZoomController,
        controllerAs: '$ctrl',
        bindToController: {
            attributes: '<?'
        },
        designerInfo: {
            attributes: {
                ngInclude: {defaultValue: '\'' + EMPTY_TEMPLATE_URL + '\''}
                //attributes: {defaultValue: "{circle: {'ng-style' : '{fill: myColor}'}}"}
            },
            size: {
                width: '200px',
                height: '178px'
            },
            icon: 'widgets'
        },
        compile: function(tElement, tAtts) {

            const attributesBySelector = {};

            // find all child elements and create a map of selectors to attributes
            tElement[0].querySelectorAll('[' + SELECTOR_ATTRIBUTE + ']').forEach(function(selectorElement) {
                const selector = selectorElement.getAttribute(SELECTOR_ATTRIBUTE);
                if (!selector) return;
                const attributes = attributesBySelector[selector] = {};
                
                Array.prototype.forEach.call(selectorElement.attributes, function(attribute) {
                    if (attribute.name !== SELECTOR_ATTRIBUTE) {
                        attributes[attribute.name] = attribute.value;
                    }
                });
            });

            // no longer need the contents, empty the element
            tElement.empty();

             return ($scope, $element, $attrs, controllers) => {
                $scope.wiFullScreen = wiFullScreen;
                const maSvgCtrl = controllers[0];
                const ngIncludeCtrl = controllers[1];

                // merge the attributes from the bindings into our object
                angular.merge(attributesBySelector, maSvgCtrl.attributes);
                
                // parse the markup and create a dom tree
                // the ngInclude directive will insert this into $element in its link function

                const $template = angular.element(
                `<div style="height: 100%;" class="OSMANOSMAN">
                    <div style="position: relative" layout="row" wi-full-screen="$ctrl.fullScreen" md-colors="{'background': 'background-hue-1'}">
                        <div style="position: absolute; bottom: 9px; right: 65px; font-size: 13px;">
                            &copy; {{'now' | maMoment:'year'}} <a class="wi-no-underline md-primary md-hue-3" href="https://www.linkedin.com/company/otomatica/" target="_blank">Otomatica</a>
                        </div>
                        <div flex style="margin:5px; padding:5px; border-width: 1px; border-style: dashed;" md-colors="{borderColor: 'accent'}">
                            ${ngIncludeCtrl.template}
                        </div>
                        <div layout="column" md-colors="{'background': 'background'}">
                            <md-button ng-disabled="!$ctrl.fullScreen && wiFullScreen.isEnabled()" class="md-icon-button md-accent" ng-click="$ctrl.fullScreen = !$ctrl.fullScreen">
                                <md-icon>{{$ctrl.fullScreen ? 'fullscreen_exit' : 'fullscreen'}}</md-icon>
                            </md-button>
                            <md-button class="md-icon-button md-primary" ng-click="$ctrl.panZoomMethod('zoomIn')">
                                <md-icon>zoom_in</md-icon>
                            </md-button>
                            <md-button class="md-icon-button md-primary" ng-click="$ctrl.panZoomMethod('zoomOut')">
                                <md-icon>zoom_out</md-icon>
                            </md-button>
                            <md-button class="md-icon-button md-accent" ng-click="$ctrl.panZoomMethod('resize', 'fit', 'resetPan')">
                                <md-icon>youtube_searched_for</md-icon>
                            </md-button>
                        </div>
                    </div>
                </div>`);
                
                // create a parent node for querying
                const rootElement = $document[0].createElement('div');
                Array.prototype.forEach.call($template, function(node) {
                    rootElement.appendChild(node);
                });

                // iterate over our selectors, find matching elements in the dom tree and add attribtues to them
                Object.keys(attributesBySelector).forEach(function(selector) {
                    const matchingElements = angular.element(rootElement.querySelectorAll(selector));
                    if (matchingElements.length) {
                        const attributes = attributesBySelector[selector];
                        Object.keys(attributes).forEach(function(attrName) {
                            matchingElements.attr(attrName, attributes[attrName]);
                        });
                    }
                });

                // ngIncludeFillContentDirective calls $element.html() with and argument of ngIncludeCtrl.template
                // This doesnt work in JQLite unless the argument is a string. Add a shim function to take care
                // of this.
                $element.html = function(content) {
                    // delete this function and restore the one from the prototype
                    delete this.html;

                    // just in case
                    if (typeof content === 'string') {
                        console.warn('Shimmed JQLite html() function was called with string content');
                        return this.html.apply(this, arguments);
                    }

                    return this.append.apply(this, arguments);
                };

                ngIncludeCtrl.template = $template.detach();
            }
        }
    };
}

export default svg;


