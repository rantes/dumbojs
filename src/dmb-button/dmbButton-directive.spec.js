
describe('dmbButton Directive', () => {
    let element = null;
    
    element = document.createElement('dmb-button');
    element.classList.add('button');
    element.classList.add('button-primary');
    document.body.append(element);

    it('Should render element', (done) => {
        expect(element).toBeDefined();
        done();
    });

});