import { DumboDirective } from "../dumbo.js";

export class DmbFooter extends DumboDirective {
    static selector = 'dmb-footer';

    init() {
        const dmbview = this.parentNode.querySelector('dmb-content');

        if(dmbview) {
            dmbview.classList.add('padded-footer');
        }
    }
}
