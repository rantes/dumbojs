/**
 * Component handle Video uploader
 * Get the elements of principal issues, and sub issues
 */ 

class DmbVideoUploader extends DumboDirective {
    constructor() {
        super();

        /**
        * Creation of html
        */
        const template = '<dmb-input type="file" dmb-name="videofile" accept="video/*"></dmb-input>' +
                         '<div class="preview"><video controls></video></div>';
        this.setTemplate(template);
    }

    init() {
        const dmbVideoInput = this.querySelector('dmb-input[type="file"]');
        const videoInput = dmbVideoInput.querySelector('input[type="file"]');
        const willPreview = this.hasAttribute('preview') && !!this.getAttribute('preview').length;

        this.hasAttribute('validate') && dmbVideoInput.setAttribute('validate', this.getAttribute('validate'));
        this.hasAttribute('dmb-name') && dmbVideoInput.setAttribute('dmb-name', this.getAttribute('dmb-name'));
        this.hasAttribute('label') && dmbVideoInput.setAttribute('label', this.getAttribute('label'));

        willPreview && videoInput.addEventListener('change', e => {
            this.loadFile(e.target.files[0]);
        });
    }
    
    loadFile (file) {
        const videoComponent = this.querySelector('.preview video');
        const reader = new FileReader();
        const promise = new Promise((resolve) => {
            reader.onload = () => {
                resolve();
                videoComponent.setAttribute('src', reader.result.toString());
            };
        });
        reader.readAsDataURL(file);
        return promise;
    }
}

customElements.define('dmb-video-uploader', DmbVideoUploader);