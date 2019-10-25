
class DmbButton extends DumboDirective {
    constructor() {
        super();
    }

    _submitter() {
        const form = this.closest('dmb-form');
        const type = this.getAttribute('type');
        
        if (type === 'submit' && form) {
            form.submit();
        }
    }

    init() {
        this.addEventListener('click', this._submitter);
    }
    
    click(method) {
        if (typeof method === 'function') {
            this.removeEventListener('click', this._submitter);
            this.addEventListener('click', method);
        }
    }
}
customElements.define('dmb-button', DmbButton);
