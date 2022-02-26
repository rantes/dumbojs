/**
 * @dmbdoc Directive
 * @name dmbButton
 * @description Will render a button
 * @attribute type posible values: submit
 */
class DmbButton extends DumboDirective {
    constructor() {
        super();
    }

    _submitter(e) {
        const form = e.target.closest('dmb-form');
        const type = e.target.getAttribute('type');

        if (form) {
            switch (type) {
            case 'submit':
                form.submit();
                break;
            case 'reset':
                form.reset();
                break;
            }
        }
    }

    init() {
        this.addEventListener('click', this._submitter);
    }
    /**
     * Attach a method to run when event click is fired.
     * @param {function} method
     */
    click(method) {
        if (typeof method === 'function') {
            this.removeEventListener('click', this._submitter);
            this.addEventListener('click', method);
        }
    }
}
customElements.define('dmb-button', DmbButton);