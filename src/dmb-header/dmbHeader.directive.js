class DmbHeader extends DumboDirective {
    constructor() {
        super();
    }

    init() {
        let titleDOM = null;

        if (this.title) {
            titleDOM = document.createElement('h2');
            titleDOM.classList.add('dmb-header-title');
            titleDOM.textContent = this.title;
            
            this.prepend(titleDOM);
        }
    }
}

customElements.define('dmb-header', DmbHeader);
