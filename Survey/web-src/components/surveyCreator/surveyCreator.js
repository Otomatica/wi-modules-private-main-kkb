import angular from 'angular';
import componentTemplate from './surveyCreator.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$element', '$state', 'wiSurvey']);

class surveyCreatorController {

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
        this.creator = this.wiSurvey.initCreator({
            that: this,
            id: 'creatorElement',
            data: null,
            locale: this.$scope.$root.User.locale,
            onSaved: this.onSaved,
            onTestSurvey: this.onTestSurvey
        });
    }

    onTestSurvey() {
        this.data = this.creator.getSurveyJSON();
        this.showDialog = true;
        this.$scope.$digest();
    }

    onSaved() {
        
    }
}

export default {
    bindings: {},
    require: {},
    controller: surveyCreatorController,
    template: componentTemplate
};