
describe('DmbInput Directive', () => {
    let element = null;
    let input = null;
    let container = null;
    
    element = document.createElement('dmb-input');
    container = document.querySelector('#components');
    element.setAttribute('label', 'label');
    container.append(element);
    
    afterEach( done => {
        element && element.remove();
        done();
    });
    
    beforeAll((done) => {
        input = element.querySelector('input');
        done();
    });
    
    it('Should render element', (done) => {
        expect(element).toBeDefined();
        done();
    });

    it('Should have label', (done) => {
        const label = element.querySelector('label');
        expect(label).toBeDefined();
        done();
    });

    it('Should have input text', (done) => {
        expect(input).toBeDefined();
        done();
    });

    it('Should validate required', (done) => {
        element.setAttribute('validate', 'required');
        input.value = null;
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        expect(input.hasAttribute('valid')).toBe(false);
        input.value = 'a value';
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        expect(input.hasAttribute('valid')).toBe(true);
        done();
    });

    it('Should validate email', (done) => {
        element.setAttribute('validate', 'email');
        input.value = 'anything but email address';
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        expect(input.hasAttribute('valid')).toBe(false);
        done();
    });
});