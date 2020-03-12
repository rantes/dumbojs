describe('DmbForm Directive', () => {
    let element = null;
    let select = null;
    let button = null;
    let inputs = null;
    let textarea = null;

    element = document.createElement('dmb-form');
    select = document.createElement('dmb-select');
    button = document.createElement('dmb-button');
    inputs = document.createElement('dmb-input');
    textarea = document.createElement('dmb-text-area');
    
    select.setAttribute('validate', 'required');
    inputs.setAttribute('validate', 'required');
    textarea.setAttribute('validate', 'required');
    button.classList.add('button');
    button.classList.add('button-primary');
    button.innerHTML = 'TestForm';

    element.append(inputs);
    element.append(select);
    element.append(textarea);
    element.append(button);
    
    document.body.append(element);

    button.setAttribute('type','submit');

    select.value = null;

    select.values = [
        {value: '', text: 'Seleccione', selected: true},
        {value: '1', text: 'Laboral'},
        {value: '2', text: 'Pension'},
        {value: '3', text: 'Accidente'}
    ];
    select.setAttribute('values', true);

    it('Should render element', () => {
        expect(element).toBeDefined();
    });
    
    it('Should validate', () => {
        expect(element.valids).toBe(0);
    });
});