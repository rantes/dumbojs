
class DmbPanel extends DumboDirective {
    static get observedAttributes() { return ['source']; }

    constructor() {
        super();
        const template = '<section class="dmb-view wrapper" transclude>' +
                        '</section>';

        this.setTemplate(template);
        this.returnValue = null;
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        !!newValue && newValue.length && this.loadExternalSource();
    }
    
    loadExternalSource() {
        const url = this.getAttribute('source');
        let wrapper = null;
        let sourceRequest = null;
        
        if (url && url.length) {
            sourceRequest = new Request(url);
            fetch(sourceRequest)
                .then(res => res.text())
                .then(data => {
                    wrapper = this.querySelector('.wrapper');
                    wrapper.innerHTML = data;
                });
        }

        return true;
    }

    close(value) {
        this.returnValue = value;
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
        (this.localName === 'dmb-dialog') && this.remove();
        this.dispatchEvent(new Event('close-dialog'));
    }

    open() {
        this.setAttribute('open','');
        this.dispatchEvent(new Event('open'));
        this.addEventListener('click', (e) => {
            if (this.openValue && e.target === this) {
                this.close('cancelled');
            }
        },true);
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

    setCloseButton() {
        let icon = null;

        if (!this.classList.contains('loader')) {
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
        message.textContent = msg;
        wrapper.append(message);
    }

    prompt(options) {
        const message = document.createElement('span');
        const wrapper = this.querySelector('.wrapper');
        let msg = options.message || '';

        this.classList.add('question');
        message.classList.add('message');
        message.textContent = msg;
        wrapper.append(message);
    }

    onClose(fn) {
        if (typeof fn === 'function') {
            this.addEventListener('close-panel', fn);
        }
    }

    init() {
        !this.classList.contains('right') && !this.classList.contains('left') && this.classList.add('right');
        !this.classList.contains('small') && !this.classList.contains('large') && this.classList.add('small');

        this.addEventListener('click', (e) => {
            e.target === this && this.close('cancelled');
        }, true);

        this.loadExternalSource();
    }
}

customElements.define('dmb-panel', DmbPanel);
