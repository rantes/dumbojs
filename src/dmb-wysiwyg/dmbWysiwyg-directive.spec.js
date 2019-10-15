
describe('dmbWYSIWYG Directive', () => {
    let element = null;
    // let textarea = null;
    // eslint-disable-next-line no-unused-vars
    let handleClick = null; // this var is actually used for spy purposes
    
    element = document.createElement('dmb-wysiwyg');
    document.body.append(element);
    let textarea = element.querySelector('textarea.dmb-wysiwyg__content-content');
    let editarea = element.querySelector('section.dmb-wysiwyg__content-content');

    beforeEach(() => {
        textarea.value = '';
        editarea.innerHTML = '';
    });

    it('Should render element', () => {
        expect(element).toBeDefined();
    });

    it('Should validate required in textarea', () => {
        element.setAttribute('validate', 'required');
        textarea.removeAttribute('hidden');
        textarea.value = null;
        textarea.dispatchEvent(new Event('focusin'));
        textarea.dispatchEvent(new Event('blur'));
        const errMsg = element.querySelector('span.error-container').innerHTML;
        expect(errMsg).toBe('Este campo es obligatorio');
    });

    it('Should validate required in editarea', () => {
        element.setAttribute('validate', 'required');
        editarea.removeAttribute('hidden');
        editarea.innerHTML = null;
        console.log('prueba1',textarea.value);
        console.log('prueba2',editarea.innerHTML);
        editarea.dispatchEvent(new Event('focusin'));
        editarea.dispatchEvent(new Event('blur'));
        const errMsg = element.querySelector('span.error-container').innerHTML;
        console.log(errMsg);
        expect(errMsg).toBe('Este campo es obligatorio');
    });

    it('Should check fills if have anything', () => {
        element.setAttribute('validate', 'required');
        textarea.value = 'prueba';
        editarea.innerHTML = 'pruebaIN';
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
});