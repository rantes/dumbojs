class DmbForm extends DumboDirective {
    constructor() {
        super();
    }
    
    submit() {
        const hasValids = items => {
            for (let i = 0; i < items.length; i++) {
                if (!items[i].hasAttribute('valid') && !items[i].hasAttribute('hidden')) {
                    items[i].reportValidity();
                    items[i].focus();
                    return false;
                }
            }

            return true;
        };
        
        document.body.dispatchEvent(window.dmbEventsService.resetValidation.event);
        document.body.dispatchEvent(window.dmbEventsService.validate.event);
        
        const inputs = this.querySelectorAll('input[validate]');
        const selects = this.querySelectorAll('select[validate]');
        const textAreas = this.querySelectorAll('textarea[validate]');
        const isAsync = this.hasAttribute('async');
        let vForm = null;
        let allInputs = null;
        let allSelects = null;
        let allTextareas = null;
        let element = null;
        let newElement = null;
    
        if (hasValids(inputs) && hasValids(selects) && hasValids(textAreas)) {
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
                allInputs = this.querySelectorAll('input');
                allSelects = this.querySelectorAll('select');
                allTextareas = this.querySelectorAll('textarea');

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
                vForm.submit();
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
