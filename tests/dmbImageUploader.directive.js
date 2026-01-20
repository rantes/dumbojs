/**
 * Component handle Imageloader
 * Get the elements of principal issues, and sub issues
 */ 

class DmbImageUploader extends DumboDirective {
    constructor() {
        super();

        /**
        * Creation of html
        */
        const template = '<dmb-input type="file" dmb-name="imgfile" accept="image/*"></dmb-input>' +
                         '<div class="preview"><img /></div>';

        this.setTemplate(template);
    }

    init() {
        /*
        * Get elements HTML and assing to a var
        */
        const dmbimgInput = this.querySelector('dmb-input[type="file"]');
        const imgInput = dmbimgInput.querySelector('input[type="file"]');
        const previewimg = this.querySelector('.preview img');
        
        previewimg.setAttribute('alt', this.getAttribute('img-alt') || 'Image Preview');
        this.hasAttribute('validate') && dmbimgInput.setAttribute('validate', this.getAttribute('validate'));
        this.hasAttribute('dmb-name') && dmbimgInput.setAttribute('dmb-name', this.getAttribute('dmb-name'));
        this.hasAttribute('label') && dmbimgInput.setAttribute('label', this.getAttribute('label'));
        /**
         * Check when the event change in Select Item, and create the options for display
         */
        imgInput.addEventListener('change', e => {
            this.loadFile(e.target.files[0]);
        });
    }

    loadFile (file) {
        const previewimg = this.querySelector('.preview img');
        const reader = new FileReader();
        const promise = new Promise((resolve) => {
            reader.onload = () => {
                resolve();
                previewimg.setAttribute('src', reader.result.toString());
            };
        });
        reader.readAsDataURL(file);
        return promise;
    }
}

customElements.define('dmb-image-uploader', DmbImageUploader);