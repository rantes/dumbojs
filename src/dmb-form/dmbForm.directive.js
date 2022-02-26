class DmbForm extends DumboDirective {
    constructor() {
        super();
        this._valids = 0;

        this.setTemplate('<form arial-role="form" transclude></form>');
        this.form = null;
        this.callback = this.callback || null;
    }

    get valids() {
        return this._valids;
    }

    init() {
        let inputs = null;
        let item = null;

        this.form = this.querySelector('form');

        this.form.setAttribute('method', this.getAttribute('method') || 'POST');
        this.form.setAttribute('action', this.getAttribute('action') || '#');
        this.form.setAttribute('autocomplete', this.getAttribute('autocomplete') || 'on');
        this.form.setAttribute('name', this.getAttribute('dmb-name') || '');
        this.form.setAttribute('target', this.getAttribute('target') || '');
        this.form.setAttribute('id', this.getAttribute('dmb-id') || this.generateId());
        this.form.setAttribute('enctype', this.getAttribute('enctype') || 'application/x-www-form-urlencoded');

        inputs = [...this.querySelectorAll('input:not([type="submit"])')];
        if (this.querySelector('input[type="submit"]') === null || inputs.length > 1) {
            while ((item = inputs.shift())) {
                item.addEventListener('keypress', e => {
                    if (13 === e.keyCode) {
                        this.submit();
                    }
                });
            }
        }
    }

    reset() {
        this.form.reset();
    }

    validate(formElements, parentSelector) {
        let item = null;
        let hasInvalids = false;

        formElements.forEach(element => {
            element.closest(parentSelector).resetValidation();
        });

        this.dispatchEvent(window.DmbEvents.formBeforeValidate.event);
        while ((item = formElements.shift())) {
            if (item.closest('.novalidate') === null) {
                item.closest(parentSelector).setValidation();

                if (!item.hasAttribute('valid') && !item.hasAttribute('hidden')) {
                    item.reportValidity();
                    item.focus();
                    hasInvalids = true;
                } else {
                    this._valids++;
                }
            }
        }

        this.dispatchEvent(window.DmbEvents.formAfterValidate.event);

        return !hasInvalids;
    }

    submit() {
        this.dispatchEvent(window.DmbEvents.formSubmit.event);
        const inputs = [...this.querySelectorAll('dmb-input[validate] input')];
        const selects = [...this.querySelectorAll('dmb-select[validate] select')];
        const textAreas = [...this.querySelectorAll('dmb-text-area[validate] textarea')];
        const isAsync = this.hasAttribute('async');
        const form = this.querySelector('form');
        let totalvalidations = 0;

        this._valids = 0;
        totalvalidations = this.validate(inputs, 'dmb-input') + this.validate(selects, 'dmb-select') + this.validate(textAreas, 'dmb-text-area');

        if (totalvalidations === 3) {

            if (isAsync) {
                if(typeof this.callback === 'function') {
                    this.callback(this);
                }
                return false;
            } else {
                form.submit();
            }

            return true;
        }

        return false;
    }

    getFormData() {
        return new FormData(this.form);
    }
}

customElements.define('dmb-form', DmbForm);