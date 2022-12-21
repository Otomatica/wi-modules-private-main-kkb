
function toArrayFilterFactory() {
    return function(obj) {
	    if (!(obj instanceof Object)) return obj;
	    return Object.keys(obj);
    };
}

export default toArrayFilterFactory;