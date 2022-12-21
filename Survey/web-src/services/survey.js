import * as Survey from 'survey-knockout';
import * as SurveyCreator from 'survey-creator';

surveyFactory.$inject = ['$timeout'];
function surveyFactory($timeout) {
    class survey {

        static initSurvey(options) {
            Survey.surveyLocalization.currentLocale = options.locale;
            Survey.StylesManager.applyTheme("modern");
            let survey = new Survey.Model(options.data || this.getSampleSurvey());
            survey.onComplete.add(() => options.onComplete.apply(options.that));
            $timeout(() => survey.render(options.id));
            return survey;
        }

        static initCreator(options) {
            SurveyCreator.localization.currentLocale = options.locale;
            SurveyCreator.StylesManager.applyTheme("modern");
            let creator = new SurveyCreator.SurveyCreator(options.id, {
                showLogicTab: true,
                showJSONEditorTab: false
            });
            creator.showToolbox = "right";
            creator.showPropertyGrid = "right";
            creator.rightContainerActiveItem("toolbox");
            creator.JSON = options.data || this.getSampleSurvey();
            creator.onTestSurveyCreated.add((sender, options) => options.survey.locale = options.locale);
            creator.saveSurveyFunc = () => options.onSaved.apply(options.that);
            creator.toolbarItems.splice(4, 0, {
                id: 'custom-preview',
                visible: true,
                title: 'Test Survey',
                action: () => options.onTestSurvey.apply(options.that)
            });

            //remove signaturepad (TODO upgrade bugged version)
            creator.toolbox.removeItem('signaturepad');
            creator.toolbox.getItemByName('image').json.imageLink = '/ui/img/logo.svg';
            creator.toolbox.getItemByName('imagepicker').json.choices.forEach((y, index) => {
                y.imageLink = '/ui/img/logo.svg';
                y.value = 'image'+(index+1);
            });

            creator.toolbox.getItemByName('html').json.html = '<iframe width="100%" height="400" src="https://www.youtube.com/embed/fLuhj5GNhqo"></iframe>';

            creator.toolbox.changeCategories([
                {
                    name: "panel",
                    category: "Panels"
                }, 
                {
                    name: "paneldynamic",
                    category: "Panels"
                }, 
                {
                    name: "matrix",
                    category: "Matrix"
                }, 
                {
                    name: "matrixdropdown",
                    category: "Matrix"
                }, 
                {
                    name: "matrixdynamic",
                    category: "Matrix"
                }
            ]);


            //points
            creator.toolbox.addItem({
                name: "points",
                isCopied: true,
                iconName: "icon-default",
                title: "All points",
                category: "Wiseif",
                json: {
                    type: "dropdown",
                    optionsCaption: "Select a point...",
                    choicesByUrl: {
                        path: "items",
                        valueName: "xid",
                        titleName: "extendedName",
                        url: "/rest/latest/data-points"
                    }
                }
            });
            
            //devices
            creator.toolbox.addItem({
                name: "devices",
                isCopied: true,
                iconName: "icon-default",
                title: "All devices",
                category: "Wiseif",
                json: {
                    type: "dropdown",
                    optionsCaption: "Select a device...",
                    choicesByUrl: {
                        url: "/rest/latest/device-names"
                    }
                }
            });

            return creator;
        }


        static getSampleSurvey() {
            return {
                "title": "Survey Title",
                "description": "Survey description",
                "showProgressBar": "both",
                "progressBarType": "pages",
                "logo": "/ui/img/logo.svg",
                "logoPosition": "right",
                "logoWidth": 120,
                "logoHeight": 50,
                "questions": [
                    {
                        "name": "name",
                        "type": "text",
                        "title": "Name:",
                        "placeHolder": "Jon Snow",
                        "isRequired": true
                    }, 
                    {
                        "name": "birthdate",
                        "type": "text",
                        "inputType": "date",
                        "title": "Birth Date:",
                        "isRequired": true
                    }, 
                    {
                        "name": "color",
                        "type": "text",
                        "inputType": "color",
                        "title": "Color:"
                    }, 
                    {
                        "name": "email",
                        "type": "text",
                        "inputType": "email",
                        "title": "E-mail Address:",
                        "placeHolder": "jon.snow@nightwatch.org",
                        "isRequired": true,
                        "validators": [
                            {
                                "type": "email"
                            }
                        ]
                    }, 
                    {
                     "type": "rating",
                     "name": "rating",
                     "title": "Rating"
                    },

                ]
            };
        }

    }
    
    return survey;
}

export default surveyFactory;




