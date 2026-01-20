describe('DmbForm Directive', () => {
    let element = null;
    let select = null;
    let button = null;
    let inputs = null;
    let textarea = null;
    let container = null;

    let input = null;

    element = document.createElement('dmb-form');
    select = document.createElement('dmb-select');
    button = document.createElement('dmb-button');
    inputs = document.createElement('dmb-input');
    textarea = document.createElement('dmb-text-area');
    container = document.querySelector('#components');
    
    container.append(element);

    select.setAttribute('validate', 'required');
    inputs.setAttribute('validate', 'required');
    textarea.setAttribute('validate', 'required');
    button.classList.add('button');
    button.classList.add('button-primary');
    button.innerHTML = 'TestForm';


    inputs.setAttribute('label', 'label');
    element.append(inputs);
    element.append(select);
    element.append(textarea);
    
    button.setAttribute('type','submit');
    element.append(button);
    
    
    select.setAttribute('values', true);
    select.value = null;

    select.values = [
        {value: '', text: 'Seleccione', selected: true},
        {value: '1', text: 'Laboral'},
        {value: '2', text: 'Pension'},
        {value: '3', text: 'Accidente'}
    ];

    afterEach( done => {
        element && element.remove();
        done();
    });

    beforeEach((done) => {
        inputs.value = '';
        select.value = null;
        input = inputs.querySelector('input');
        done();
    });

    it('Should render element', (done) => {
        expect(element).toBeDefined();
        done();
    });
    
    it('Should validate', (done) => {
        element.submit();
        expect(element.valids).toBe(0);
        done();
    });

    it('Should have valid inputs', (done) => {
        inputs.value = 'value';
        element.submit();
        expect(element.valids).toBe(1);
        done();
    });
});