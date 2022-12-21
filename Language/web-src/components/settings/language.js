
import componentTemplate from './language.html';

const $inject = Object.freeze(['$scope', 'maLocales', 'maDialogHelper', 'wiLanguage']);

class languageController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, maLocales, maDialogHelper, wiLanguage) {
        this.$scope = $scope;
        this.maLocales = maLocales;
        this.maDialogHelper = maDialogHelper;
        this.wiLanguage = wiLanguage;
    }

    $onInit() {
        this.maLocales.get().then(l => this.locales = l);
        this.$scope.query = {
            filter: '',
            order: 'key',
            limit: 20,
            page: 1
        };

        this.locale = this.$scope.$root.User.locale;
        this.localeChanged();
    }

    localeChanged() {
        this.roots = [];
        this.selection = [];
        this.$scope.promise = this.wiLanguage.getLanguage(this.locale);
        this.$scope.promise.then(e => {
            this.roots = Object.keys(e.translations['root']).map(k => ({ key: k, value: e.translations['root'][k] }) );

            Object.keys(e.translations).sort().forEach(l => {
                if(l == 'root') return;
                let locale = { 
                    fileName: 'i18n_' + l.replace(/-/g, '_') + '.properties',
                    translations: e.translations[l]
                };
                this.count(locale);
                this.selection.push(locale);
            });
        });
    }

    count(locale) {
        let count = 0;
        Object.keys(locale.translations).forEach(x => {
            if(this.roots.find(r => r.key == x)) return;
            count++;
        });
        locale.misMatch = count;
    }

    clean(locale) {
        /*cleanup mismatched translations*/
        Object.keys(locale.translations).forEach(x => {
            if(this.roots.find(r => r.key == x)) return;
            delete locale.translations[x];
        });
        locale.misMatch = 0;
    }

    save(selectedLocale) {
        this.wiLanguage.saveTranslations(selectedLocale).then(e => {
            this.maDialogHelper.toastOptions({textTr: ['language.settings.meSaved', selectedLocale.fileName]});
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['language.settings.meNotSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        });
    }

    parts(key) {
        return key.match(/[^\.]+\.?|\//g);
    }
}

export default {
    bindings: {},
    require: {},
    controller: languageController,
    template: componentTemplate
};