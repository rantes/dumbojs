const vDom = document.cloneNode(true);

// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
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

Window.prototype.DmbEvents = {
    panelClose: {event: new Event('dmb-panel.close'), listener: 'dmb-panel.close'},
    panelOpen: {event: new Event('dmb-panel.open'), listener: 'dmb-panel.open'},
    panelClosed: {event: new Event('dmb-panel.closed'), listener: 'dmb-panel.closed'},
    panelOpened: {event: new Event('dmb-panel.opened'), listener: 'dmb-panel.opened'},
    resetValidation: {event: new Event('dmb-validation.reset'), listener: 'dmb-validation.reset'},
    validate: {event: new Event('dmb-validation.validate'), listener: 'dmb-validation.validate'},
    dialogClose: {event: new Event('dmb-dialog.close'), listener: 'dmb-dialog.close'},
    dialogOpen: {event: new Event('dmb-dialog.open'), listener: 'dmb-dialog.open'},
    pageLoaderClose: {event: new Event('dmb-page-loader.close'), listener: 'dmb-page-loader.close'},
    formSubmit: {event: new Event('dmb-form.submit'), listener: 'dmb-form.submit'},
    formBeforeValidate: {event: new Event('dmb-form.before-validate'), listener: 'dmb-form.before-validate'},
    formAfterValidate: {event: new Event('dmb-form.after-validate'), listener: 'dmb-form.after-validate'}
};
