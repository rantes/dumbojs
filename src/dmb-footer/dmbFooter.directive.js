class DmbFooter extends DumboDirective {
    constructor() {
        super();
    }
    
    init() {
        const dmbview = this.parentNode.querySelector('dmb-content');

        if(dmbview) {
            dmbview.classList.add('padded-footer');
        }
    }
}

customElements.define('dmb-footer', DmbFooter);