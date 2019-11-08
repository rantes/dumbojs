class DmbForm extends DumboDirective {
    constructor() {
        super();
        this.valids = 0;
    }
    
    submit() {
        const hasValids = (items, parentSelector) => {
            let item = null;
            let parent = null;
            let hasInvalids = false;

            while ((item = items.pop())) {
                if (item.closest('.novalidate') === null) {
                    parent = item.closest(parentSelector);
                    parent.resetValidation();
                    parent.setValidation();
    
                    if (!item.hasAttribute('valid') && !item.hasAttribute('hidden')) {
                        item.reportValidity();
                        item.focus();
                        hasInvalids = true;
                    } else {
                        this.valids++;
                    }
                }
            }
            return !hasInvalids;
        };

        const inputs = [...this.querySelectorAll('dmb-input input[validate]')];
        const selects = [...this.querySelectorAll('dmb-select select[validate]')];
        const textAreas = [...this.querySelectorAll('dmb-text-area textarea[validate]')];
        const isAsync = this.hasAttribute('async');
        let totalvalidations = 0;
        let vForm = null;
        let allInputs = null;
        let allSelects = null;
        let allTextareas = null;
        let element = null;
        let newElement = null;

        this.valids = 0;
        totalvalidations = hasValids(inputs, 'dmb-input') + hasValids(selects, 'dmb-select') + hasValids(textAreas, 'dmb-text-area');
    
        if (totalvalidations === 3) {
            this.dispatchEvent(new Event('onsubmit'));

            if (isAsync) {
                if (typeof this.callback === 'function') {
                    this.callback();
                } 
            } else {
                vForm = document.createElement('form');
                vForm.method = this.getAttribute('method');
                vForm.action = this.getAttribute('action');
                vForm.name = this.getAttribute('dmb-name');
                vForm.style = 'visibility: hidden; height: 0; width: 0;';
                allInputs = [...this.querySelectorAll('input')];
                allSelects = [...this.querySelectorAll('select')];
                allTextareas = [...this.querySelectorAll('textarea')];

                while((element = allInputs.pop())) {
                    newElement = element.cloneNode(true);
                    newElement.value = element.value;
                    vForm.append(newElement);
                }
                
                while((element = allSelects.pop())) {
                    newElement = element.cloneNode(true);
                    newElement.value = element.value;
                    vForm.append(newElement);
                }

                while((element = allTextareas.pop())) {
                    newElement = element.cloneNode(true);
                    newElement.value = element.value;
                    vForm.append(newElement);
                }

                document.body.append(vForm);
                this.getAttribute('action') && vForm.submit();
            }

            return true;
        }
    
        return false;
    }

    getFormData() {
        const formObject = new FormData();

        [].forEach.call(this.querySelectorAll('input'), input => {
            formObject.append(input.getAttribute('name'), input.value);
        });

        [].forEach.call(this.querySelectorAll('select'), select => {
            formObject.append(select.getAttribute('name'), select.value);
        });

        [].forEach.call(this.querySelectorAll('textarea'), textarea => {
            formObject.append(textarea.getAttribute('name'), textarea.value);
        });

        return formObject;
    }
}

customElements.define('dmb-form', DmbForm);