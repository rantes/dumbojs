
describe('dmbInput Directive', () => {
    let element = null;
    
    element = document.createElement('dmb-input');
    element.setAttribute('validate', 'required');
    element.setAttribute('label', 'label');
    document.body.append(element);

    // beforeEach(() => {
    // });

    it('Should render element', () => {
        expect(element).toBeDefined();
    });

    it('Should have label', () => {
        const label = element.querySelector('label');
        expect(label).toBeDefined();
    });

    it('Should have input text', () => {
        const input = element.querySelector('input');
        expect(input).toBeDefined();
    });

    it('Should validate required', () => {
        const input = element.querySelector('input');
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        const errMsg = element.querySelector('span.error-container');
        expect(errMsg).toBeDefined();
    });

});