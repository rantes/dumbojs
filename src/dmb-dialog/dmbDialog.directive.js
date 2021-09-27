
class DmbDialog extends DumboDirective {
    static get observedAttributes() { return ['open']; }

    constructor() {
        super();

        const template = '<dmb-view class="wrapper" transclude>' +
                        '</dmb-view>';

        this.setTemplate(template);
        this.returnValue = null;
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        this.openValue = (newValue !== null);
    }

    close(value) {
        this.returnValue = value;
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
        (this.localName === 'dmb-dialog') && this.remove();
        this.dispatchEvent(new Event('close-dialog'));
        return true;
    }

    open() {
        this.hasAttribute('open') || this.setAttribute('open','');
        this.dispatchEvent(new Event('open'));
    }

    showModal() {
        const buttons = this.querySelectorAll('[type="modal-answer"]');
        
        [].forEach.call(buttons, button => {
            button.addEventListener('click', e => {
                this.close(e.target.getAttribute('value'));
            });
        });
        this.open();
    }

    init() {
        let delay = 1000 * this.getAttribute('delay');
        this.hasAttribute('no-close') || this.setCloseButton();

        setTimeout(() => {
            this.open();
        }, delay);
    }

    setCloseButton() {
        let icon = null;

        if (!this.classList.contains('loader')) {
            icon = this.querySelector('.close-modal-button');
            if(!icon || !icon.length) {
                icon = document.createElement('i');
                icon.classList.add('icon');
                icon.classList.add('icon-cancel');
                icon.classList.add('close-modal-button');
                icon.addEventListener('click', (e) => {
                    e.target.closest('dmb-dialog').close('cancelled');
                });
                this.querySelector('.wrapper').prepend(icon);
            }
        }
    }

    isOpen() {
        return this.openValue;
    }

    setIcon(icon) {
        const iconElement = document.createElement('i');
        const wrapper = this.querySelector('.wrapper');

        iconElement.classList.add('icon');
        iconElement.classList.add(`icon-${icon}`);

        wrapper.prepend(iconElement);
    }

    error(msg) {
        const message = document.createElement('span');
        const wrapper = this.querySelector('.wrapper');
        
        this.setCloseButton();
        this.setIcon('alert');
        msg = msg || '';
        this.classList.add('error');
        message.classList.add('message');
        if (typeof msg === 'string') {
            message.innerHTML = msg;
        } else {
            message.append(msg);
        }
        wrapper.append(message);
    }

    info(msg) {
        const message = document.createElement('span');
        const wrapper = this.querySelector('.wrapper');
        
        this.setCloseButton();
        this.setIcon('info');
        msg = msg || '';
        this.classList.add('info');
        message.classList.add('message');
        if (typeof msg === 'string') {
            message.innerHTML = msg;
        } else {
            message.append(msg);
        }
        wrapper.append(message);
    }

    prompt(options) {
        const message = document.createElement('span');
        const wrapper = this.querySelector('.wrapper');
        let msg = options.message || '';

        this.classList.add('question');
        message.classList.add('message');
        if (typeof msg === 'string') {
            message.innerHTML = msg;
        } else {
            message.append(msg);
        }
        wrapper.append(message);
    }

    onClose(fn) {
        if (typeof fn === 'function') {
            this.addEventListener('close-dialog', fn);
        }
    }
}
customElements.define('dmb-dialog', DmbDialog);