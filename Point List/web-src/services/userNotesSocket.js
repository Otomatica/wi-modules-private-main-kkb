
userNotesSocketFactory.$inject = ['maRestResource'];
function userNotesSocketFactory(RestResource) {
    const webSocketUrl = '/rest/latest/websocket/user-comments';

    class userNotesSocketResources extends RestResource {
        static get webSocketUrl() {
            return webSocketUrl;
        }
    }
    return userNotesSocketResources;
}

export default userNotesSocketFactory;