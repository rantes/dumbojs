class DmbMenuButton extends DumboDirective {
    constructor() {
        super();
        
        let template = '<i class="icon icon-bars"></i>' +
                        '<span class="legend"></span>';

        this.setTemplate(template);

    }
    
    init() {
        const legend = this.getAttribute('legend');

        this.querySelector('.legend').textContent = legend;
        this.addEventListener('click', () => {
            let menu = this.getAttribute('menu');
    
            if (menu.length) {
                document.querySelector(menu).showModal();
            }
        });
    }
}

customElements.define('dmb-menu-button',DmbMenuButton);
