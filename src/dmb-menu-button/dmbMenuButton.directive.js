import { DumboDirective } from "../dumbo.js";
export class DmbMenuButton extends DumboDirective {
    static selector = 'dmb-menu-button';
    static template = '<i class="icon icon-bars"></i>' +
        '<span class="legend" transclude></span>';

    init() {
        this.addEventListener('click', () => {
            let menu = this.getAttribute('menu');
    
            if (menu.length) {
                document.querySelector(menu).showModal();
            }
        });
    }
}
