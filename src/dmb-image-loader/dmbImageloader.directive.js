/**
 * Component handle Imageloader
 * Get the elements of principal issues, and sub issues
 */ 

class DmbImageloader extends DumboDirective {
    constructor() {
        super();

        /**
        * Creation of html
        */
        const template = '<input id="img-uploader" type="file" name="preload" accept="image/*"/>' +
                            '<div class="preview"><img alt="Image Preview"></div>';
        this.setTemplate(template);
    }

    init() {
        /*
        * Get elements HTML and assing to a var
        */
        let imgloader = this.querySelector('input[type="file"]');
        
        /**
         * Check when the event change in Select Item, and create the options for display
         */
        imgloader.addEventListener('change', e => {
            this.loadFile(e.target.files[0]);
        });
    }
    
    loadFile (file) {
        let previewimg = this.querySelector('.preview img');
        let reader = new FileReader();
        reader.onload = () => {
            previewimg.setAttribute('src', reader.result.toString());
        };
        reader.readAsDataURL(file);
    }
}

customElements.define('dmb-imageloader', DmbImageloader);