
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
        let submitButton = null;
        this.addEventListener('click', this._submitter);
        if(this.getAttribute('type') === 'submit') {
            submitButton =  document.createElement('input');
            submitButton.setAttribute('type', 'submit');
            submitButton.style.height = 0;
            submitButton.style.width = 0;
            submitButton.style.opacity = 0;
            submitButton.style.border = 0;
            submitButton.style.padding = 0;
            submitButton.style.margin = 0;
            this.appendChild(submitButton);
        }
    }
    
    click(method) {
        if (typeof method === 'function') {
            this.removeEventListener('click', this._submitter);
            this.addEventListener('click', method);
        }
    }
}
customElements.define('dmb-button', DmbButton);
