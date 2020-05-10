class DmbForm extends DumboDirective {
    constructor() {
        super();
        this._valids = 0;

        this.setTemplate('<form arial-role="form" transclude></form>');
        this.form = null;
    }

    get valids() {
        return this._valids;
    }

    init() {
        this.form = this.querySelector('form');

        this.form.setAttribute('method', this.getAttribute('method') || 'POST');
        this.form.setAttribute('action', this.getAttribute('action') || '#');
        this.form.setAttribute('name', this.getAttribute('dmb-name') || '');
        this.form.setAttribute('id', this.getAttribute('dmb-id') || null);
        this.form.setAttribute('enctype', this.getAttribute('enctype') || 'text/plain');

        this.form.onSubmit = e => {
            e.preventDefault();
            return this.submit();
        };
    }

    validate(formElements, parentSelector) {
        let item = null;
        let parent = null;
        let hasInvalids = false;

        while ((item = formElements.shift())) {
            if (item.closest('.novalidate') === null) {
                parent = item.closest(parentSelector);
                parent.resetValidation();
                parent.setValidation();

                if (!item.hasAttribute('valid') && !item.hasAttribute('hidden')) {
                    item.reportValidity();
                    item.focus();
                    hasInvalids = true;
                } else {
                    this._valids++;
                }
            }
        }
        return !hasInvalids;
    }

    submit() {
        const inputs = [...this.querySelectorAll('dmb-input input[validate]')];
        const selects = [...this.querySelectorAll('dmb-select select[validate]')];
        const textAreas = [...this.querySelectorAll('dmb-text-area textarea[validate]')];
        const isAsync = this.hasAttribute('async');
        let totalvalidations = 0;

        this._valids = 0;
        totalvalidations = this.validate(inputs, 'dmb-input') + this.validate(selects, 'dmb-select') + this.validate(textAreas, 'dmb-text-area');
    
        if (totalvalidations === 3) {
            this.dispatchEvent(new Event('onsubmit'));

            if (isAsync && typeof this.callback === 'function') {
                this.callback();
                return false;
            } else {
                this.form.submit();
            }

            return true;
        }

        return false;
    }

    getFormData() {
        let name = '';
        let i = 0;
        let inputLength = 0;
        const formObject = new FormData();

        [].forEach.call(this.querySelectorAll('input'), input => {
            name = input.getAttribute('name');
            if(input.type === 'file') {
                inputLength = input.files.length;
                if(inputLength === 1) {
                    formObject.append(`${name}`, input.files[0], input.files[0].name);
                } else if(inputLength > 1) {
                    for(i = 0; i < inputLength; i++) {
                        formObject.append(`${name}[]`, input.files[i], input.files[i].name);
                    }
                }
            } else {
                formObject.append(name, input.value);
            }
        });

        [].forEach.call(this.querySelectorAll('select'), select => {
            if(select.multiple) {
                formObject.append(select.getAttribute('name'), [...select.querySelectorAll('option')].filter(x=>x.selected).map(x=>x.value.trim()));
            } else {
                formObject.append(select.getAttribute('name'), select.value);
            }
        });

        [].forEach.call(this.querySelectorAll('textarea'), textarea => {
            formObject.append(textarea.getAttribute('name'), textarea.value);
        });

        return formObject;
    }
}

customElements.define('dmb-form', DmbForm);