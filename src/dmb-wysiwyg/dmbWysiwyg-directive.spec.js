
describe('dmbWYSIWYG Directive', () => {
    let element = null;
    
    element = document.createElement('dmb-wysiwyg');
    document.body.append(element);

    it('Should render element', () => {
        expect(element).toBeDefined();
    });

});