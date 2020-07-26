describe('DmbImageUploader Directive', () => {
    let element = null;
    // eslint-disable-next-line no-unused-vars
    let loadFile = null; // this var is actually used for spy purposes

    const contentType = 'image/png';
    const img1px = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

    element = document.createElement('dmb-image-uploader');
    document.body.append(element);

    const dataURLtoFile = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
    
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
        
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
        
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };
  
    const imgFile = dataURLtoFile(img1px, contentType);
    let previewimg = element.querySelector('.preview img');

    it('Should render element', () => {
        expect(element).toBeDefined();
    });

    loadFile = function(target) {
        console.log(`trying to send data to ${target}`);
    };

    it('Should check if element was render', () => {
        spyOn(element, 'loadFile');
        element.querySelector('input[type="file"]').dispatchEvent(new Event('change'));
        expect(element.loadFile).toHaveBeenCalled();
    });

    it('Should load the image in content preview', () => {
        previewimg.src = '';
        element.loadFile(imgFile).then(() => {
            expect(previewimg.getAttribute('src')).toBe(`data:image/png;base64,${img1px}`);
        });
    });
});