class DmbInfoPop extends DumboDirective {
    constructor() {
        super();

        const template = '<div class="float-content" transclude></div>';
        
        this.setTemplate(template);
    }

    init() {
        const size = this.getAttribute('size') || 'small';

        this.querySelector('.float-content').classList.add(`float-content_${size}`);
    }

}

customElements.define('dmb-info-pop', DmbInfoPop);