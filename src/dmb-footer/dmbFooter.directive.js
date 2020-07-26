class DmbFooter extends DumboDirective {
    constructor() {
        super();
    }
    
    init() {
        let dmbview = null;

        dmbview = this.closest('dmb-view');
        if(!dmbview) {
            dmbview = this.closest('.dmb-view');
        }
        dmbview.classList.add('padded-footer');
    }
}
customElements.define('dmb-footer', DmbFooter);
