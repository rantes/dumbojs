class DmbClosePanel extends DumboDirective {
    constructor() {
        super();

        const template = '<i class="icon"></i>';
        
        this.setTemplate(template);
    }
    
    init() {
        const orientation = this.getAttribute('orientation') || 'right';
        const icon = this.querySelector('i.icon');
        let panel = null;

        this.classList.add(orientation);
        icon.classList.add(`icon-chevron-${orientation}`);


        this.addEventListener('click', () => {
            panel = this.closest('dmb-panel');
            panel.close();
        });
    }
}

customElements.define('dmb-close-panel', DmbClosePanel);
