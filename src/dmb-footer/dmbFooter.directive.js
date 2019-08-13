class DmbFooter extends DumboDirective {
    constructor() {
        super();
    }
    
    init() {
        this.classList.add('dmb-footer');
        this.closest('.dmb-view').classList.add('padded-footer');
    }
}
customElements.define('dmb-footer', DmbFooter);
