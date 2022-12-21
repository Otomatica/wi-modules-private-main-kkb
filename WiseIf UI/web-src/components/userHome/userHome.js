
const $inject = Object.freeze(['$location', '$rootScope']);
class userHomeController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($location, $rootScope) {
        if($rootScope.lastUrl == $rootScope.User.current.homeUrl)
            return $location.replace().url('');
        $location.url('');
    }

}
export default {
    bindings: {},
    require: {},
    designerInfo: {
        hideFromMenu: true
    },
    controller: userHomeController
};