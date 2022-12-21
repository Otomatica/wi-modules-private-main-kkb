fullscreen.$inject = ['wiFullScreen'];
function fullscreen(Fullscreen) {
    return {
        restrict: 'A',
        scope: false,
        designerInfo: {
            hideFromMenu: true
        },
        link : function ($scope, $element, $attrs) { 
            // Watch for changes on scope if model is provided
            if ($attrs.wiFullScreen) {
            $scope.$watch($attrs.wiFullScreen, function(value, old) {
                if(value == old) return;
                    var isEnabled = Fullscreen.isEnabled();
                    if (value && !isEnabled) {
                        Fullscreen.enable($element[0]);
                        $element.addClass('isInFullScreen');
                    } else if (!value && isEnabled) {
                        Fullscreen.cancel();
                        $element.removeClass('isInFullScreen');
                    }
                });

                // Listen on the `FBFullscreen.change`
                // the event will fire when anything changes the fullscreen mode
                var removeFullscreenHandler = Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled) {
                    if(!isFullscreenEnabled) {
                        $scope.$evalAsync(function() {
                            $scope.$eval($attrs.wiFullScreen + '= false');
                            $element.removeClass('isInFullScreen');
                        });
                    }
                });

                $scope.$on('$destroy', function() {
                    removeFullscreenHandler();
                });

            } else {
                if ($attrs.onlyWatchedProperty !== undefined) {
                    return;
                }

                $element.on('click', function (ev) {
                    Fullscreen.enable(  $element[0] );
                });
            }
        }
    };
}

export default fullscreen;