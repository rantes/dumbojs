class DmbTextArea extends DumboDirective {
    static get observedAttributes() { return ['valid','name', 'validate', 'dmb-name']; }

    constructor() {
        super();

        const template = '<label></label>' +
                        '<textarea transclude>' +
                        '</textarea>';

        this.setTemplate(template);
        this.isValid = false;
        this.validators = [];
        this._errorInputClass = '_error';
        this.validations = {
            _required: function (value) {
                let response = {
                    valid: true,
                    error: null
                };

                if (typeof value === 'undefined' || value === null || value === '') {
                    response.valid = false;
                }

                return response;
            },
            _numeric: function (value) {
                let response = {
                        valid: true,
                        error: null
                    },
                    re = /^[0-9]\d*/;

                if (value && !re.test(value)) {
                    response.valid = false;
                }

                return response;
            },
            _min: function(value, param) {
                let response = {
                    valid: true,
                    error: null
                };

                if (value && value.length < param) {
                    response.valid = false;
                }

                return response;
            },
            _max: function(value, param) {
                let response = {
                    valid: true,
                    error: null
                };

                if (value && value.length > param) {
                    response.valid = false;
                }

                return response;
            }
        };
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        const input = this.querySelector('textarea');

        switch(attr) {
        case 'valid':
            this.isValid = (newValue !== null);
            break;
        case 'name':
            if (input) input.setAttribute('name',newValue);
            break;
        case 'dmb-name':
            if (input) input.setAttribute('name',newValue);
            break;
        case 'validate':
            if (input) input.setAttribute('validate',newValue);
            break;
        }

    }

    init() {
        let input = this.getElementsByTagName('textarea').item(0);

        this.querySelector('label').innerText = this.getAttribute('label');
        input.setAttribute('aria-label',this.getAttribute('label') || '');
        input.setAttribute('masked',this.getAttribute('masked') || '');
        input.setAttribute('autocomplete',this.getAttribute('autocomplete') || '');
        input.setAttribute('class',this.getAttribute('dmb-class') || '');
        input.setAttribute('name',this.getAttribute('dmb-name') || '');
        input.setAttribute('validate',this.getAttribute('validate') || '');
        input.setAttribute('placeholder',this.getAttribute('placeholder') || '');
        input.setAttribute('valid','true');
        input.id = this.getAttribute('dmb-id')|| this.generateId();

        const maskInputUppercase = (e) => {
            e.target.value = e.target.value.toUpperCase();
        };

        if (input && this.getAttribute('validate')) {
            this.validators = this.buildValidators(input, this);
        }

        input.addEventListener('blur', (e) => {
            this._runValidators(e.target, this.validators);
        }, {capture: true, passive: true});

        const maskInputAlpha = (e) => {
            let char = e.which || e.keyCode;

            if ((char < 65 || char > 90) && (char < 97 || char > 122)) {
                return false;
            }
        };

        const maskInputNumeric = (e) => {
            let char = e.which || e.keyCode;

            if (char < 48 || char > 57) {
                return false;
            }
        };

        if (this.getAttribute('validate')) {
            this.validators = this.buildValidators(input, this);

            input.addEventListener('blur', (e) => {
                this._runValidators(e.target, this.validators);
            }, true);
        }

        if (this.getAttribute('masked')) {
            switch (this.getAttribute('masked')) {
            case 'alpha':
                input.onkeypress = maskInputAlpha;
                break;
            case 'numeric':
                input.onkeypress = maskInputNumeric;
                break;
            case 'uppercase':
                input.oninput = maskInputUppercase;
                break;
            }
        }
    }

    _runValidators (element, validators) {
        let unknownValidator = () => {
            return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
        };
        let content = element.value.trim();
        let valid = true;
        let validator= null;
        let func = null;
        let result = null;

        element.value = content;
        for (var i = 0, len = validators.length; i < len; i++) {
            validator = validators[i];
            func = this.validations['_' + validator.key] || unknownValidator;

            result = func(content, validator.param);
            if (result.valid !== true) {
                valid = false;
                break;
            }
        }

        if (valid === true) {
            element.parentNode.classList.remove(this._errorInputClass);
        } else {
            element.parentNode.classList.add(this._errorInputClass);
        }
        this.isValid = valid;
        valid? element.setAttribute('valid','') : element.removeAttribute('valid');
    }

    buildValidators (element, scope) {
        let validators = [],
            validatorList = (scope.getAttribute('validate') || '').split(',');

        for (let i = 0, len = validatorList.length; i < len; i++) {
            let keyParam = validatorList[i].split(':');

            if (keyParam[0]) {
                validators.push({
                    key: keyParam[0],
                    param: keyParam.length === 2 ? keyParam[1] : null
                });

                if (keyParam[0] === 'required') {
                    element.parentNode.classList.add('required');
                    element.setAttribute('required','required');
                }
            }
        }

        return validators;
    }

    resetValidation() {
        let elements = this.getElementsByClassName(this._errorInputClass);
        for (let i = 0; elements.length; i++) {
            elements.item(0).classList.remove(this._errorInputClass);
        }
    }

    setValidation() {
        this._runValidators(this.querySelector('textarea'), this.validators);
    }
}

customElements.define('dmb-textarea', DmbTextArea);