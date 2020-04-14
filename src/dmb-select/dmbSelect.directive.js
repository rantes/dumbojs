class DmbSelect extends DumboDirective {
    static get observedAttributes() { return ['valid','values', 'dmb-name']; }

    constructor() {
        super();

        const template = '<label></label>' +
                        '<select transclude></select>' +
                        '<span class="error-container"></span>';

        this.setTemplate(template);
        this.validations = {
            _required: value => {
                let response = {
                    valid: true,
                    error: null
                };

                if (typeof value === 'undefined' || value === null || value === '') {
                    response.valid = false;
                    response.error = 'Este campo es obligatorio';
                }

                return response;
            }
        };
        this.isValid = false;
        this.values = [];
        this.validators = [];
        this._errorInputClass = '_error';
    }

    init() {
        let select = this.querySelector('select');
        let value = null;
        let options = null;
        let option = null;
        let opval = null;

        this.querySelector('label').innerText = this.getAttribute('label');
        select.setAttribute('aria-label',this.getAttribute('label') || '');
        select.setAttribute('class',this.getAttribute('dmb-class') || '');
        select.setAttribute('name',this.getAttribute('dmb-name') || '');
        select.setAttribute('valid','true');
        select.setAttribute('validate',this.getAttribute('validate'));
        select.id = this.getAttribute('dmb-id') || this.generateId();

        if (select && this.hasAttribute('value')) {
            value = this.getAttribute('value').trim();
            try {
                value = JSON.parse(value);
            } catch (e) {
                console.log(e.message);
            }
        }

        select.multiple = this.hasAttribute('multiple');
        select.value = value;

        if (select && this.getAttribute('validate')) {
            this.validators = this.buildValidators(select, this.getAttribute('validate'));
        }

        select.addEventListener('blur', (e) => {
            this._runValidators(e.target, this.validators);
        }, {capture: true, passive: true});

        options = [...select.querySelectorAll('option')];
        if(options.length){
            while((option = options.shift())) {
                opval = isNaN(option.value) ? option.value : parseInt(option.value);
                option.selected = select.multiple ? value.includes(opval) : (option.value === value);
            }
        }

    }

    _runValidators(element, validators) {
        let unknownValidator = () => {
            return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
        };
        let options = element.querySelectorAll('option');
        let content = [...options].filter(x=>x.selected).map(x=>x.value.trim());
        let valid = true,
            validator= null,
            func = null,
            result = null,
            message = null;

        !element.multiple && (element.value = content[0]);
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
        valid? element.setAttribute('valid',true) : element.removeAttribute('valid');
    }

    buildValidators(element, validations) {
        let validators = [];
        let validatorList = (validations || '').split(',');
        let keyParam = '';

        for (let i = 0, len = validatorList.length; i < len; i++) {
            keyParam = validatorList[i].split(':');

            if (keyParam[0]) {
                validators.push({
                    key: keyParam[0],
                    param: keyParam.length === 2 ? keyParam[1] : null
                });

                if (keyParam[0] === 'required') {
                    element.parentNode.classList.add('required');
                    element.setAttribute('required',true);
                }
            }
        }

        return validators;
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        let select = this.querySelector('select');

        switch(attr) {
        case 'valid':
            this.isValid = (newValue !== null);
            break;
        case 'values':
            if (!oldValue && newValue) {
                this.buildOptions();
                this.querySelector('select').dispatchEvent(new Event('change'));
            }
            break;
        case 'dmb-name':
            if (select) this.querySelector('select').setAttribute('name', newValue);
            break;
        }
    }
    /**
     * Build the inner options for the select
     */
    buildOptions() {
        let i = 0;
        let total = this.values.length || 0;
        let option = null;
        const select = this.querySelector('select');

        select.innerHTML = '';
        if(!select.multiple) select.value = null;

        for (i = 0; i < total; i++) {
            option = document.createElement('option');
            option.setAttribute('value',this.values[i].value);
            option.innerHTML = this.values[i].text;
            if (this.values[i].selected || this.values[i] === select.value || (Array.isArray(select.value) && select.value.includes(this.values[i]))) {
                option.setAttribute('selected',true);
                if(!select.multiple) select.value = this.values[i].value;
            }
            select.append(option);
        }

        this.removeAttribute('values');
    }

    resetValidation() {
        let elements = this.getElementsByClassName(this._errorInputClass);
        for (let i = 0; elements.length; i++) {
            elements.item(0).classList.remove(this._errorInputClass);
        }
    }

    setValidation() {
        this._runValidators(this.querySelector('select'), this.validators);
    }
}

customElements.define('dmb-select', DmbSelect);
