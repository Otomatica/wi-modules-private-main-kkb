
fullScreenFactory.$inject = ['$document', '$rootScope', '$stateParams'];
function fullScreenFactory($document, $rootScope, $stateParams) {

    var document = $document[0];
    var observer;

    // ensure ALLOW_KEYBOARD_INPUT is available and enabled
    var isKeyboardAvailbleOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;

    var emitter = $rootScope.$new();

    // listen event on document instead of element to avoid firefox limitation
    // see https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
    $document.on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
        !serviceInstance.isEnabled() && serviceInstance.cancel();
        emitter.$emit('FBFullscreen.change', serviceInstance.isEnabled());
    });

    var serviceInstance = {
        $on: angular.bind(emitter, emitter.$on),
        all: function() {
            serviceInstance.enable( document.documentElement );
        },
        enable: function(element) {
            if(element.requestFullScreen) {
                element.requestFullScreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                // Safari temporary fix
                 element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }

            //initial attachment
            
            //bryntum
            let floatElement = document.querySelector('.b-float-root');
            floatElement && element.appendChild(floatElement);

            //toast
            document.querySelectorAll('md-toast').forEach(mutatedElement => {
                element.appendChild(mutatedElement);
            });

            //.md-autocomplete-suggestions-container
            document.querySelectorAll('.md-autocomplete-suggestions-container').forEach(mutatedElement => {
                element.appendChild(mutatedElement);
            });

            let materialTags = ['MD-EDIT-DIALOG', 'MD-BOTTOM-SHEET', 'MD-TOAST'];
            let materialSelectors = [
                'md-scroll-mask', 'md-dialog-container', 'md-dialog-backdrop', 'md-panel-outer-wrapper', 
                'md-visually-hidden', 'md-select-backdrop', 'md-select-menu-container',  'md-bottom-sheet-backdrop', 
                'md-autocomplete-suggestions-container', 'md-edit-dialog-backdrop'
            ];

            const callback = function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    mutation.addedNodes.forEach(mutatedElement => {
                        let floatSelectors = materialSelectors.some(selector => mutatedElement.className.includes(selector));
                        let floatTags = materialTags.some(selector => mutatedElement.tagName == selector);
                        
                        let isDialog = ['md-dialog-backdrop','md-dialog-container'].some(selector => mutatedElement.className.includes(selector));
                        isDialog && (mutatedElement.style.position = 'fixed');

                        if(floatSelectors || floatTags)
                            element.appendChild(mutatedElement) && (mutatedElement.style.height = null); // TODO is it fix something ??
                    });
                }
            };

            observer = new MutationObserver(callback);
            //const config = { attributes: true, childList: true, subtree: true };
            const config = {childList: true};
            observer.observe(document.body, config);
        },
        cancel: function() {
            if(document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

            if($stateParams.dateBarFulscreen) {
                $stateParams.dateBar = $stateParams.dateBarFulscreen;
                delete $stateParams.dateBarFulscreen;
            }
            observer && observer.disconnect();

            //initial deAttachment for autocomplete-suggestions-container
            document.querySelectorAll('.md-autocomplete-suggestions-container').forEach(mutatedElement => {
                document.body.appendChild(mutatedElement);
            });
        },
        isEnabled: function() {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            return fullscreenElement ? true : false;
        },
        toggleAll: function() {
            serviceInstance.isEnabled() ? serviceInstance.cancel() : serviceInstance.all();
        },
        isSupported: function() {
            var docElm = document.documentElement;
            var requestFullscreen = docElm.requestFullScreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullscreen || docElm.msRequestFullscreen;
            return requestFullscreen ? true : false;
        }
    };

    return serviceInstance;
}

export default fullScreenFactory;