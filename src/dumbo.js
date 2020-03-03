const vDom = document.cloneNode(true);

class DumboFactory {
    setTemplate(template) {
        this.childrenTemplate = vDom.querySelector(`#${this.constructor.name}-template`);
        
        if (!this.childrenTemplate) {
            this.childrenTemplate = vDom.createElement('template');
            this.childrenTemplate.id = `${this.constructor.name}-template`;
            this.childrenTemplate.innerHTML = template;
            vDom.body.appendChild(this.childrenTemplate);
        }
    }
}

class DumboDirective extends HTMLElement {
    constructor () {
        super();
    }
    
    setTemplate(template) {
        this.childrenTemplate = vDom.querySelector(`#${this.constructor.name}-template`);
        
        if (!this.childrenTemplate) {
            this.childrenTemplate = vDom.createElement('template');
            this.childrenTemplate.id = `${this.constructor.name}-template`;
            this.childrenTemplate.innerHTML = template;
            vDom.body.appendChild(this.childrenTemplate);
        }
    }

    connectedCallback() {
        let temp = null;
        let transclude = null;

        this.pre();

        if (!this.hasAttribute('rendered')) {
            if (this.childrenTemplate) {
                temp = this.childrenTemplate.content.cloneNode(true);
                transclude = temp.querySelector('[transclude]');
            }

            if (transclude) {
                transclude.innerHTML = this.innerHTML;
                this.innerHTML = null;
            }

            if (temp) {
                this.appendChild(temp);
            }
            
            this.setAttribute('rendered', 'true');
        }

        this.init();
    }

    pre() {}

    init() {}

    generateId(limit = 6) { return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, limit - 1); }
}
