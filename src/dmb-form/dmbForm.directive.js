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

    reset() {
        this.form.reset();
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
        const inputs = [...this.querySelectorAll('dmb-input[validate] input')];
        const selects = [...this.querySelectorAll('dmb-select[validate] select')];
        const textAreas = [...this.querySelectorAll('dmb-text-area[validate] textarea')];
        const isAsync = this.hasAttribute('async');
        let totalvalidations = 0;

        this._valids = 0;
        totalvalidations = this.validate(inputs, 'dmb-input') + this.validate(selects, 'dmb-select') + this.validate(textAreas, 'dmb-text-area');

        if (totalvalidations === 3) {
            this.dispatchEvent(new Event('onsubmit'));

            if (isAsync) {
                if(typeof this.callback === 'function') this.callback();
            } else {
                this.form.submit();
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