(function(){
    this.FormUtility = function() {
	var defaults = {};

	if (arguments[0] && typeof arguments[0] === "object") {
	    this.options = extendedDefaults(defaults, arguments[0]);
	}

	initializeMethods.call(this);
    };

    FormUtility.prototype.init = function() {
	console.log(this);
    };

    function extendedDefaults(source, properties) {
	var property;
	for (property in properties) {
	    if (properties.hasOwnProperty(property)) {
		source[property] = properties[property];
	    }
	}
	return source;
    }

    function initializeMethods() {
	this.init.bind(this);
    }
}());
