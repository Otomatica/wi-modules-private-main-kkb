
languageServiceFactory.$inject = ['maTranslate', '$http'];
function languageServiceFactory(maTranslate, $http) {
    
    const translationsUrl = '/rest/latest/translations';
    const languageUrl = '/rest/latest/language';
    class languageResource extends maTranslate {
        
        static getLanguage(locale) {
            return $http({
                method: 'GET',
                url: translationsUrl,
                params: {
                    server: true, 
                    language: locale
                }
            }).then((e) => {
                return e.data;
            });
        }

        static saveTranslations(translation) {
            return $http({
                method: 'POST',
                url: languageUrl,
                data: translation
            }).then((e) => {
                return e.data;
            });
        }

    }


    return languageResource;
}

export default languageServiceFactory;