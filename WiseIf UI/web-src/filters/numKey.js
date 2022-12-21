
function numKeyFilterFactory() {
    return function(input) {
    	if(!input) return 0;
        return Object.keys(input).length;
    };
}

export default numKeyFilterFactory;