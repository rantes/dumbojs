
describe('DmbInput Directive', () => {
    let element = null;
    let input = null;
    
    element = document.createElement('dmb-input');
    element.setAttribute('label', 'label');
    document.body.append(element);

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