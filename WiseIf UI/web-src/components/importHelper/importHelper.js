
import componentTemplate from './importHelper.html';

const $inject = Object.freeze(['$scope', '$mdMedia', '$element']);
class importHelperController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
    }

    $onInit() {

    }

    uploadFilesButtonClicked(event) {
        this.$element.maFind('input[type=file]')
            .val(null)
            .maClick();
    }

    uploadFilesChanged(event) {
        this.$scope.$apply(() => {
            this.initial = undefined;
            this.result = undefined;
            this.errorMessage = undefined;
        });
        if (event.target.files.length <= 0) return false;

        let file = event.target.files.item(0);
        this.$scope.$apply(() => {
            this.progress = true;
            this.errorMessage = file.name;
        });

        let fr = new FileReader();
        fr.onload = (e) => { 
            try {
                let result = JSON.parse(e.target.result);
                this.initial = JSON.stringify(result, null, 2);

                let clone =  {
                    pointList: result.pointList,
                    graphView: result.graphView
                };

                clone.pointList && clone.pointList.forEach((p) => {
                    p.readPermission = p.readPermissions;
                    p.editPermission = p.editPermissions;
                    p.context = p.context && JSON.parse(p.context);
                    delete p.readPermissions;
                    delete p.editPermissions;
                });

                clone.graphView && clone.graphView.forEach((p) => {
                    p.context = p.context && JSON.parse(p.context);
                    p.context.src = p.context && p.context.src && p.context.src.replace('/v2/', '/latest/');
                });

                this.result = JSON.stringify(clone, null, 2);
            }
            catch(err) {
                this.errorMessage += ': ' + err;
            }

            this.progress = false;
            this.$scope.$digest();
        }
        fr.readAsText(file);
    };

}
export default {
    bindings: {},
    designerInfo: {
        hideFromMenu: true,
    },
    require: {},
    controller: importHelperController,
    template: componentTemplate
};