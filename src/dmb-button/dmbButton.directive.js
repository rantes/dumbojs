
class DmbButton extends DumboDirective {
    constructor() {
        super();
    }

    init() {
        
        this.addEventListener('click', () => {
            const form = this.closest('dmb-form');
            const type = this.getAttribute('type');
            
            if (type === 'submit' && form) {
                form.submit();
            }
        });
    }
    
    click(method) {
        if (typeof method === 'function') {
            this.addEventListener('click', method);
        }
    }
}
customElements.define('dmb-button', DmbButton);
