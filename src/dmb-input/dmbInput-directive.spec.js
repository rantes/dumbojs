
describe('DmbInput Directive', () => {
    let element = null;
    let input = null;
    
    element = document.createElement('dmb-input');
    element.setAttribute('label', 'label');
    document.body.append(element);
    input = element.querySelector('input');

    it('Should render element', () => {
        expect(element).toBeDefined();
    });

    it('Should have label', () => {
        const label = element.querySelector('label');
        expect(label).toBeDefined();
    });

    it('Should have input text', () => {
        expect(input).toBeDefined();
    });

    it('Should validate required', () => {
        element.setAttribute('validate', 'required');
        input.value = null;
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        expect(input.hasAttribute('valid')).toBe(false);
    });

    it('Should validate email', () => {
        element.setAttribute('validate', 'email');
        input.value = 'anything but email address';
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        expect(input.hasAttribute('valid')).toBe(false);
    });
});