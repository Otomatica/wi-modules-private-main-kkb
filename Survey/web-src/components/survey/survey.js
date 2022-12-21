import angular from 'angular';
import componentTemplate from './survey.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$element', '$state', 'wiSurvey']);

class surveyController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, wiSurvey) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.wiSurvey = wiSurvey;
    }

    $onInit() {
        this.survey = this.wiSurvey.initSurvey({
            that: this,
            id: 'surveyElement',
            data: this.data,
            locale: this.$scope.$root.User.locale,
            onComplete: this.onComplete
        });
    }

    onComplete(result) {
        this.result = "Result JSON:\n" + JSON.stringify(result.data, null, 3);
    }
}

export default {
    bindings: {
        data: '<?'
    },
    require: {},
    controller: surveyController,
    template: componentTemplate
};