(function(){
    this.FormUtility = function FormUtility() {

        this.formSelector = null;
        this.myForm = null;

        var defaults = {
            select2: false
        };

        if (arguments && arguments.length !== 0) {

            // Check length of arguments if more than two, throw an error
            if (arguments.length > 2) throw new Error("FormUtility library only accepts one or two parameters. first: \"the form selector (e.g. id, class, name)\", second: \"FormUtility options or configurations\"");

            var argInd;
            for (argInd in arguments) {
                switch (typeof arguments[argInd]) {
                    case "string":
                        if (parseInt(argInd) === 0) {
                            this.formSelector = arguments[argInd];
                        }
                        break;

                    case "object":
                        if (parseInt(argInd) === 1) {
                            this.options = _extendedDefaults(defaults, arguments[argInd]);
                        }
                        break;
                        
                    default:
                        break;
                }
            }
        }
        
        this.select2 = defaults.select2;

        _initializeMethods.call(this);
    };

    FormUtility.prototype.init = function init() {
        var _this = this;

        // Catch if no formSelector defined
        if (_this.formSelector === null) throw new ReferenceError("FormUtility Error: No form selector was supplied to FormUtility instance. Please define one.");

        _this.formSelector = _this.formSelector.replace(/\s/g, "");

        if (document.getElementById(_this.formSelector)) { // Test if formSelector is an ID
            _this.myForm = document.getElementById(_this.formSelector);
        } else if (document.forms[_this.formSelector]) { // Test if formSelector is a form name attribute
            _this.myForm = document.forms[_this.formSelector];
        } else { // Test if formSelector is a CSS class
            _this.myForm = document.getElementsByClassName(_this.formSelector).length > 0 ? document.getElementsByClassName(_this.formSelector)[0] : _this.myForm;
        }

        var privateMyForm = _this.myForm;

        // Check if privateMyForm is null, then throw an error
        if (privateMyForm === null) throw new DOMException("FormUtility cannot find the specified form from the given form selector: "+_this.formSelector, "UndefinedForm");

        HTMLFormElement.prototype.getElements = function() {
            return _getFormElements.call(_this);
        }
        HTMLFormElement.prototype.serialize = function(arg) {
            arg = (arg===undefined) ? false : arg;

            return _serializeForm.call(_this, arg);
        }
        
        _comboToSelect2.call(_this);
    };

    FormUtility.prototype.getForm = function getForm() {
        var _this = this;

        if (!_this.myForm) throw new DOMException("FormUtility cannot find the specified form from the given form selector: "+_this.formSelector, "UndefinedForm");

        return _this.myForm;
    };

    FormUtility.prototype.getFormElements = function formElements() {
        var _this = this;

        if (_this.myForm===null) throw new DOMException("FormUtility cannot find the specified form from the given form selector: "+_this.formSelector, "UndefinedForm");

        return _getFormElements.call(_this);
    };

    FormUtility.prototype.formSerialize = function formSerialize() {
        var arg = (arguments[0] && arguments[0].length > 0) ? arguments[0] : false;
            
        return _serializeForm.call(this, arg);
    };

    FormUtility.prototype.formSubmit = function formSubmit() {
        var _this = this;
        var _form = _this.myForm;
        var _args = arguments;
        var _defaults = {};

        if (arguments[0] && typeof arguments[0] === "object") {
            // Check for "callback" property on arguments[0]
            if (arguments[0].hasOwnProperty("callback") && typeof arguments[0].callback === "function") {
                _defaults = _extendedDefaults(_defaults, arguments[0]);
            }
        }

        if (window.addEventListener) {
            _form.addEventListener("submit", function(event) {
                event.preventDefault();
                
                if (_args.callee.name === "formSubmit") {
                    _defaults.callback(_this.myForm, event);
                }
            });
        }
    };

    FormUtility.prototype.tableGrid = function tableGrid() {

    };

    function _comboToSelect2() {
        var elements = _getFormElements.call(this);
        for (var i in elements) {
            if (!isNaN(parseInt(i))) {
                if (elements[i].type !== "select-one") { continue; }

                if (this.options.select2) {
                    
                    if (window.jQuery === undefined) { throw new ReferenceError("jQuery is required to load select2"); }
        
                    if (jQuery.prototype.select2 === undefined) { throw new TypeError("Select2 was not found on your source file. See https://select2.org/getting-started/installation for installation."); }
        
                    jQuery(elements[i]).select2();
                }
            }
        }
    }

    function _getFormElements() {

        var elements = (this.myForm === undefined) ? this.elements : this.myForm.elements;
        var filteredElements = [];
        
        if (elements) {
            for (var elem in elements) {
                if (!isNaN(parseInt(elem))) {
                    switch (elements[elem].type) {
                        case 'text':
                        case 'email':
                        case 'date':
                        case 'number':
                        case 'password':
                        case 'tel':
                        case 'radio':
                        case 'checkbox':
                        case 'select-one':
                        case 'textarea':
                            filteredElements.push(elements[elem]);
                            break;

                        default:
                            break;
                    }
                }
            }
        }

        return filteredElements;
    }

    /**
     * Method to serialize form elements into server-readable inputs
     * 
     * @param boolean $verbose Flag if detailed FormData or not
     * 
     * @return instanceof FormData $data
     */
    function _serializeForm($verbose) {
        var elements = _getFormElements.call(this);
        var serializedElements = {};

        if (elements) {
            for (var elem in elements) {
                if (!isNaN(parseInt(elem))) {
                    switch (elements[elem].type) {
                        case 'radio':
                            if (elements[elem].checked) {
                                
                                if ($verbose) {
                                    var data = {
                                        type: elements[elem].type,
                                        value: elements[elem].value
                                    };

                                    serializedElements[elements[elem].name] = data;
                                    continue;
                                }

                                serializedElements[elements[elem].name] = elements[elem].value;
                            }
                            break;
                        default:
                            if ($verbose) {
                                var data = {
                                    type: elements[elem].type,
                                    value: elements[elem].value
                                };

                                serializedElements[elements[elem].name] = data;
                                continue;
                            }

                            serializedElements[elements[elem].name] = elements[elem].value;
                            break;
                    }
                }
            }
            return JSON.stringify(serializedElements);
        }
    }

    /**
     * Method to merge object arguments from user-defined arguments and/or values
     * 
     * @param object source 
     * @param object properties 
     * 
     * @return object of arguments
     */
    function _extendedDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    function _initializeMethods() {
        this.init.bind(this);
        this.getForm.bind(this);
        this.getFormElements.bind(this);
        this.formSerialize.bind(this);
        this.formSubmit.bind(this);
        this.tableGrid.bind(this);
    }
}());