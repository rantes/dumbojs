
describe('dmbWYSIWYG Directive', () => {
    let element = null;
    let textarea = null;
    let editarea = null;
    
    element = document.createElement('dmb-wysiwyg');
    document.body.append(element);
    textarea = element.querySelector('textarea.dmb-wysiwyg__content-content');
    editarea = element.querySelector('section.dmb-wysiwyg__content-content');
    
    beforeEach(() => {
        textarea.value = '';
        editarea.innerHTML = '';
    });

    it('Should render element', () => {
        expect(element).toBeDefined();
    });

    it('Should check fields if have data', () => {
        element.setAttribute('validate', 'required');
        textarea.value = 'prueba';
        editarea.innerHTML = 'prueba';
        editarea.dispatchEvent(new Event('focusin'));
        editarea.dispatchEvent(new Event('blur'));
        const errMsg = element.querySelector('span.error-container').innerHTML;
        expect(errMsg).toBe('');
    });

    it('Should sync data from textarea to editarea', () => {
        editarea.setAttribute('hidden', true);
        textarea.removeAttribute('hidden');
        editarea.innerHTML = '';
        textarea.value = 'texto';
        element.syncData();
        expect(editarea.innerHTML).toBe('texto');
    });

    it('Should sync data from editarea to textarea', () => {
        textarea.setAttribute('hidden', true);
        editarea.removeAttribute('hidden');
        textarea.value = '';
        editarea.innerHTML = 'texto';
        element.syncData();
        expect(textarea.value).toBe('texto');
    });

    it('Should validate required in textarea', () => {
        element.setAttribute('validate', 'required');
        editarea.setAttribute('hidden',true);
        textarea.removeAttribute('hidden');
        textarea.value = null;
        textarea.dispatchEvent(new Event('focusin'));
        textarea.dispatchEvent(new Event('blur'));
        const errMsg = element.querySelector('span.error-container').innerHTML;
        expect(errMsg).toBe('Este campo es obligatorio');
    });

    it('Should validate required in editarea', () => {
        element.setAttribute('validate', 'required');
        textarea.setAttribute('hidden',true);
        editarea.removeAttribute('hidden');
        editarea.innerHTML = '';
        editarea.dispatchEvent(new Event('focusin'));
        editarea.dispatchEvent(new Event('blur'));
        const errMsg = element.querySelector('span.error-container').innerHTML;
        expect(errMsg).toBe('Este campo es obligatorio');
    });
});