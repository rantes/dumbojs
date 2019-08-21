
describe('dmbButton Directive', () => {
    let element = null;
    
    element = document.createElement('dmb-button');
    element.classList.add('button');
    element.classList.add('button-primary');
    element.innerHTML = 'Button';
    document.body.append(element);

    it('Should render element', () => {
        expect(element).toBeDefined();
    });

});