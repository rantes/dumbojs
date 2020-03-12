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
                vForm.enctype = this.getAttribute('enctype');
                vForm.style = 'visibility: hidden; height: 0; width: 0;';
                allInputs = [...this.querySelectorAll('input')];
                allSelects = [...this.querySelectorAll('select')];
                allTextareas = [...this.querySelectorAll('textarea')];

                while((element = allInputs.shift())) {
                    newElement = element.cloneNode(true);
                    if(element.type === 'file') {
                        newElement.files = element.files;
                    } else {
                        newElement.value = element.value;
                    }
                    vForm.appendChild(newElement);
                }

                while((element = allSelects.shift())) {
                    newElement = element.cloneNode(true);
                    newElement.value = element.value;
                    vForm.appendChild(newElement);
                }
                
                while((element = allTextareas.shift())) {
                    newElement = element.cloneNode(true);
                    newElement.value = element.value;
                    vForm.appendChild(newElement);
                }

                document.body.appendChild(vForm);
                this.getAttribute('action') && vForm.submit();
            }

            return true;
        }
    
        return false;
    }

    getFormData() {
        let name = '';
        let i = 0;
        let inputLength = 0;
        const formObject = new FormData();

        [].forEach.call(this.querySelectorAll('input'), input => {
            name = input.getAttribute('name');
            if(input.type === 'file') {
                inputLength = input.files.length;
                if(inputLength === 1) {
                    formObject.append(`${name}`, input.files[0], input.files[0].name);
                } else if(inputLength > 1) {
                    for(i = 0; i < inputLength; i++) {
                        formObject.append(`${name}[]`, input.files[i], input.files[i].name);
                    }
                }
            } else {
                formObject.append(name, input.value);
            }
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