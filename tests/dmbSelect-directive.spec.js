
describe('DmbSelect Directive', () => {
    let element = null;
    let input = null;
    let container = null;
    
    element = document.createElement('dmb-select');
    container = document.querySelector('#components');
    element.setAttribute('label', 'label');
    container.append(element);

    element.setAttribute('values', true);
    element.value = null;

    element.values = [
        {value: '', text: 'Seleccione', selected: true},
        {value: '1', text: 'Laboral'},
        {value: '2', text: 'Pension'},
        {value: '3', text: 'Accidente'}
    ];

    afterEach( done => {
        element && element.remove();
        done();
    });

    beforeAll((done) => {
        input = element.querySelector('select');
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

    it('Should have select', (done) => {
        expect(input).toBeDefined();
        done();
    });

    it('Should validate required', (done) => {
        element.setAttribute('validate', 'required');
        element.value = '';
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        expect(input.hasAttribute('valid')).toBe(false);
        element.value = '1';
        input.dispatchEvent(new Event('focusin'));
        input.dispatchEvent(new Event('blur'));
        expect(input.hasAttribute('valid')).toBe(true);
        done();
    });
});