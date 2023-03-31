
describe('dmbButton Directive', () => {
    let element = null;
    let container = null;
    
    container = document.querySelector('#components');
    element = document.createElement('dmb-button');
    element.classList.add('button');
    element.classList.add('button-primary');
    container.append(element);

    afterEach( done => {
        element && element.remove();
        done();
    });

    it('Should render element', (done) => {
        expect(element).toBeDefined();
        done();
    });

});