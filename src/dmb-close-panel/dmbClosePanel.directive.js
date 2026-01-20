import { DumboDirective } from "../dumbo.js";

export class DmbClosePanel extends DumboDirective {
    static selector = 'dmb-close-panel';
    static template = './dmbClosePanel.html';

    init() {
        const orientation = this.getAttribute('orientation') || 'right';
        const icon = this.querySelector('span[icon]');
        let panel = null;

        this.classList.add(orientation);
        icon.classList.add(`chevron_${orientation}`);


        this.addEventListener('click', () => {
            panel = this.closest('dmb-panel');
            panel.close();
        });
    }
}
