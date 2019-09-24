
class DmbInput extends DumboDirective {
    static get observedAttributes() { return ['valid','name', 'validate', 'dmb-name', 'validate']; }

    constructor() {
        super();

        const template = '<label></label>' +
                        '<input type="text" placeholder="" />' +
                        '<span class="error-container"></span>';

        this.setTemplate(template);
        this.isValid = false;
        this._errorInputClass = '_error';
        this.validations = {
            _required: function (value) {
                let response = {
                    valid: true,
                    error: null
                };

                if (typeof value === 'undefined' || value === null || value === '') {
                    response.valid = false;
                    response.error = 'Este campo es obligatorio';
                }

                return response;
            },
            _email: function (value) {
                let response = {
                        valid: true,
                        error: null
                    },
                    re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

                if (value && !re.test(value)) {
                    response.valid = false;
                    response.error = 'No es una direcci&oacute;n de email v&aacute;lido';
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
                    response.error = 'Este campo debe ser solo num&eacute;rico';
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
                    response.error = 'Este campo debe ser de ' + param + ' caracteres m&iacute;nimo';
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
                    response.error = 'Este campo debe ser de ' + param + ' caracteres m&aacute;ximo';
                }

                return response;
            }
        };
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        const input = this.querySelector('input');

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
            this.setValidation();
            break;
        }
    }

    buildValidators () {
        let validators = [];
        let validatorList = (this.getAttribute('validate') || '').split(',');

        for (var i = 0, len = validatorList.length; i < len; i++) {
            var keyParam = validatorList[i].split(':');

            if (keyParam[0]) {
                validators.push({
                    key: keyParam[0],
                    param: keyParam.length === 2 ? keyParam[1] : null
                });

                if (keyParam[0] === 'required') {
                    this.parentNode.classList.add('required');
                    this.setAttribute('required','required');
                }
            }
        }

        return validators;
    }

    _runValidators(element, validators) {
        var unknownValidator = () => {
                return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
            },
            content = element.value.trim(),
            valid = true,
            validator= null,
            func = null,
            result = null,
            message = null;

        element.value = content;
        for (var i = 0, len = validators.length; i < len; i++) {
            validator = validators[i];
            func = this.validations['_' + validator.key] || unknownValidator;

            result = func(content, validator.param);
            if (result.valid !== true) {
                valid = false;
                message = result.error;
                break;
            }
        }

        if (valid === true) {
            element.parentNode.classList.remove(this._errorInputClass);
            element.parentNode.querySelectorAll('.error-container').item(0).innerHTML = '';
        } else {
            element.parentNode.classList.add(this._errorInputClass);
            element.parentNode.querySelectorAll('.error-container').item(0).innerHTML = message;
        }
        this.isValid = valid;
        valid? element.setAttribute('valid','') : element.removeAttribute('valid');
    }

    setValidation() {
        let validators = [];
        const input = this.querySelector('input');

        validators = this.buildValidators();

        input.addEventListener('blur', (e) => {
            this._runValidators(e.target, validators);
        }, true);

        document.body.addEventListener(window.dmbEventsService.validate.listener, () => {
            this._runValidators(input, validators);
        }, true);

        document.body.addEventListener(window.dmbEventsService.resetValidation.listener, () => {
            let elements = this.getElementsByClassName(this._errorInputClass);

            for (let i = 0; elements.length; i++) {
                elements.item(0).classList.remove(this._errorInputClass);
            }
        }, true);
    }

    init() {
        let input = this.getElementsByTagName('input').item(0);

        this.querySelector('label').innerText = this.getAttribute('label');
        input.setAttribute('aria-label',this.getAttribute('label') || '');
        input.setAttribute('masked',this.getAttribute('masked') || '');
        input.setAttribute('autocomplete',this.getAttribute('autocomplete') || '');
        input.setAttribute('type',this.getAttribute('type') || 'text');
        input.setAttribute('class',this.getAttribute('dmb-class') || '');
        input.setAttribute('name',this.getAttribute('dmb-name') || '');
        input.setAttribute('validate',this.getAttribute('validate') || '');
        input.setAttribute('placeholder',this.getAttribute('placeholder') || this.getAttribute('label') || '');
        input.setAttribute('valid','true');
        input.id = this.getAttribute('dmb-id')|| this.generateId();
        input.value = this.getAttribute('value');
        
        const maskInputUppercase = (e) => {
            e.target.value = e.target.value.toUpperCase();
        };
    
        const maskInputAlpha = (e) => {
            var char = e.which || e.keyCode;
    
            if ((char < 65 || char > 90) && (char < 97 || char > 122)) {
                return false;
            }
        };
    
        const maskInputNumeric = (e) => {
            var char = e.which || e.keyCode;
    
            if (char < 48 || char > 57) {
                return false;
            }
        };

        if (this.getAttribute('validate')) {
            this.setValidation();
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
}

customElements.define('dmb-input',DmbInput);
