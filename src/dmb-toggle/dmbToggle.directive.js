class DmbToggle extends DumboDirective {
    static get observedAttributes() { return ['value']; }
    constructor() {
        super();

        const template = '<span class="switch"></span>';
        this.setTemplate(template);
        this.val = 0;
    }

    set value(val = 0) {
        this.val = val;
        this.setStatus();
    }

    get value() {
        return this.val;
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        switch(attr) {
        case 'value':
            this.val = parseInt(newValue);
            this.setStatus();
            break;
        }
    }

    init() {
        this.val = parseInt(this.getAttribute('value') || '0');
        this.setStatus();

        this.addEventListener('click', () => {
            this.val = 1 * !this.val;
            this.setStatus();
        });
    }

    setStatus() {
        if (this.val === 1) {
            this.classList.add('on');
        } else {
            this.classList.remove('on');
        }
    }

    /**
     * Attach a method to run when event click is fired.
     * @param {function} method
     */
    click(method) {
        if (typeof method === 'function') {
            this.addEventListener('click', method);
        }
    }
}

customElements.define('dmb-toggle', DmbToggle);