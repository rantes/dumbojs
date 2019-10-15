class DmbWysiwyg extends DumboDirective {
    static get observedAttributes() { return ['valid','name', 'validate', 'dmb-name']; }

    constructor() {
        super();

        const template = '<section class="dmb-wysiwyg" >' +
                            '<div class="dmb-wysiwyg__toolbar">' +
                                '<a href="#" title="Heading 2" class="dmb-wysiwyg__toolbar-button" data-command="h2">H2</a>' +
                                '<a href="#" title="Heading 3" class="dmb-wysiwyg__toolbar-button" data-command="h3">H3</a>' +
                                '<a href="#" title="Heading 4" class="dmb-wysiwyg__toolbar-button" data-command="h4">H4</a>' +
                                '<a href="#" title="Heading 5" class="dmb-wysiwyg__toolbar-button" data-command="h5">H5</a>' +
                                '<a href="#" title="Heading 6" class="dmb-wysiwyg__toolbar-button" data-command="h6">H6</a>' +
                                '<a href="#" title="Undo" class="icon icon-undo dmb-wysiwyg__toolbar-button" data-command="undo"></a>' +
                                '<a href="#" title="Redo" class="icon icon-redo dmb-wysiwyg__toolbar-button" data-command="redo"></a>' +
                                '<a href="#" title="Paragraph" class="icon icon-pilcrow dmb-wysiwyg__toolbar-button" data-command="p"></a>' +
                                '<a href="#" title="Link" class="icon icon-link dmb-wysiwyg__toolbar-button" data-command="createlink"></a>' +
                                '<a href="#" title="Left Align" class="icon icon-paragraph-left dmb-wysiwyg__toolbar-button" data-command="justifyLeft"></a>' +
                                '<a href="#" title="Center Align" class="icon icon-paragraph-center dmb-wysiwyg__toolbar-button" data-command="justifyCenter"></a>' +
                                '<a href="#" title="Justify Align" class="icon icon-paragraph-justify dmb-wysiwyg__toolbar-button" data-command="justifyFull"></a>' +
                                '<a href="#" title="right Align" class="icon icon-paragraph-right dmb-wysiwyg__toolbar-button" data-command="justifyRight"></a>' +
                                '<a href="#" title="Super" class="icon icon-superscript2 dmb-wysiwyg__toolbar-button" data-command="superscript"></a>' +
                                '<div title="Font Color" class="dmb-wysiwyg__toolbar-button palette">' +
                                    '<i class="icon icon-brush"></i>' +
                                    '<div class="fore-palette"></div>' +
                                '</div>' +
                                '<div title="Background Color" class="dmb-wysiwyg__toolbar-button back-palette">' +
                                    '<i class="icon icon-palette"></i>' +
                                    '<div class="fore-palette"></div>' +
                                '</div>' +
                                '<a href="#" title="View Source" class="dmb-wysiwyg__toolbar-button source-button" data-command="source" style="width: 4em;">Source</a>' +
                                '<a href="#" title="View compiled" class="dmb-wysiwyg__toolbar-button normal-button" data-command="normal" style="display:none;">Normal</a>' +
                            '</div>' +
                            '<textarea class="dmb-wysiwyg__content-content"></textarea>' +
                            '<section class="dmb-wysiwyg__content-content" contenteditable transclude>' +
                            '</section>' +
                            '<span class="error-container"></span>' +
                        '</section>';

        this.setTemplate(template);
        this.isValid = false;
        this._errorWysiwygClass = 'v_error';
        this.colorPalette = ['000000', 'FF9966', '6699FF', '99FF66','CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
        this.toolbarElements = [];
        this.validations = {
            _required: function (value) {
                let response = {
                    valid: true,
                    error: null
                };
                if (typeof value === 'undefined' || value === null || value === '') {
                    response.valid = false;
                    response.error = 'Este campo es obligatorio';
                }
                return response;
            }
        };
    }

    init() {
        const forePalette = this.querySelector('.palette .fore-palette');
        const backPalette = this.querySelector('.back-palette .fore-palette');
        let hideButtons = null;
        let showButtons = null;
        let executeCommand = null;
        let a = document.createElement('a');
        let ap = document.createElement('a');
        let textArea = this.querySelector('textarea.dmb-wysiwyg__content-content');
        // let editArea = this.querySelector('section.dmb-wysiwyg__content-content');
        this.toolbarElements = this.querySelectorAll('.dmb-wysiwyg__toolbar-button');

        a.dataset.command = 'foreColor';
        ap.dataset.command = 'backColor';
        a.setAttribute('href','#');
        ap.setAttribute('href','#');
        a.classList.add('palette-item');
        ap.classList.add('palette-item');
        a.classList.add('dmb-wysiwyg__toolbar-button');
        ap.classList.add('dmb-wysiwyg__toolbar-button');

        for (let i = 0; i < this.colorPalette.length; i++) {
            a.dataset.value = `${this.colorPalette[i]}`;
            ap.dataset.value = `${this.colorPalette[i]}`;
            a.style.backgroundColor = `#${this.colorPalette[i]}`;
            ap.style.backgroundColor = `#${this.colorPalette[i]}`;
            forePalette.append(a.cloneNode(true));
            backPalette.append(ap.cloneNode(true));
        }

        textArea.setAttribute('hidden', true);
        textArea.value = this.querySelector('textArea.dmb-wysiwyg__content-content').innerHTML;
        textArea.setAttribute('dmb-name',this.getAttribute('dmb-name') || '');
        textArea.setAttribute('validate',this.getAttribute('validate') || '');
        textArea.setAttribute('valid','true');

        hideButtons = (toolbarElements) => {
            for (let j = 0; j < toolbarElements.length; j++) {
                toolbarElements[j].style.display = 'none';
            }
        };

        showButtons = (toolbarElements) => {
            for (let j = 0; j < toolbarElements.length; j++) {
                toolbarElements[j].style.display = 'flex';
            }
        };

        executeCommand = (e) => {
            const me = e.target;
            let command = me.dataset.command;
            let value = me.dataset.value;
            let url;
            let textArea;
            let editArea;

            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            switch (command) {
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
            case 'p':
                document.execCommand('formatBlock', true, command);
                break;
            case 'foreColor':
            case 'backColor':
                document.execCommand(command, true, value);
                break;
            case 'createlink':
            case 'insertimage':
                url = prompt('Enter the link here: ','');
                if (url && url.length) {
                    document.execCommand(command, false, url);
                }
                break;
            case 'source':
                hideButtons(this.toolbarElements);
                me.parentNode.querySelector('.normal-button').style.display = 'flex';
                textArea = me.parentNode.parentNode.querySelector('textarea.dmb-wysiwyg__content-content');
                editArea = me.parentNode.parentNode.querySelector('section.dmb-wysiwyg__content-content');

                // textArea.classList.add('dmb-wysiwyg__content-content');
                // editArea.parentNode.replaceChild(textArea, editArea);
                textArea.value = editArea.innerHTML;
                textArea.setAttribute('hidden', false);
                textArea.removeAttribute('hidden');
                editArea.setAttribute('hidden', true);
                break;
            case 'normal':
                showButtons(this.toolbarElements);
                me.style.display = 'none';
                // editArea = document.createElement('div');
                textArea = me.parentNode.parentNode.querySelector('textarea.dmb-wysiwyg__content-content');
                editArea = me.parentNode.parentNode.querySelector('section.dmb-wysiwyg__content-content');

                // editArea.classList.add('dmb-wysiwyg__content-content');
                // editArea.setAttribute('contenteditable', true);
                // editArea.innerHTML = textArea.value;
                // textArea.parentElement.replaceChild(editArea, textArea);
                editArea.innerHTML = textArea.value;
                editArea.setAttribute('hidden', false);
                editArea.removeAttribute('hidden');
                textArea.setAttribute('hidden', true);
                break;
            default:
                document.execCommand(command, false, null);
                break;
            }

        };

        for (let i = 0; i < this.toolbarElements.length; i++) {
            this.toolbarElements[i].addEventListener('click', executeCommand);
        }

        if (this.getAttribute('validate') && this.getAttribute('validate').length) {
            this.setValidation();
        }
    }
    ///////////////////// SPECS
    Click() {
        document.body.dispatchEvent(window.dmbEventsService.resetValidation.event);
        document.body.dispatchEvent(window.dmbEventsService.validate.event);

        this.valids = this.querySelectorAll('input[valid]');

        if (this.valids.length === 2) {
            this.handleClick(this.getAttribute('target'));
        }
    }

    handleClick() {
        const init = {
            method: 'POST',
            body: new URLSearchParams(new FormData(this.querySelector('form[name="contactus"]')))
        };
        const contactusRequest = new Request('/apiweb/contactus', init);

        fetch(contactusRequest)
            .then(response => {
                if (!response.ok) throw new Error('Datos faltantes o con errores');
                return response.json();
            })
            .then((response) => {
                document.cookie = 'ssid=' + response.id;
                window.dmbDialogService.closeAll();
                window.location = '/apiweb/contactus';
            })
            .catch(error => {
                window.dmbDialogService.closeAll();
                window.dmbDialogService.error(error);
            });
    }

    ///////////////////// SPECS ends

    buildValidators () {
        let validators = [];
        let validatorList = (this.getAttribute('validate') || '').split(',');
        let textarea = null;
        let editArea = null;

        for (let i = 0, len = validatorList.length; i < len; i++) {
            let keyParam = validatorList[i].split(':');

            if (keyParam[0]) {
                validators.push({
                    key: keyParam[0],
                    param: keyParam.length === 2 ? keyParam[1] : null
                });

                if (keyParam[0] === 'required') {
                    textarea = this.querySelector('textarea');
                    this.classList.add('required');
                    textarea.setAttribute('required','required');
                }

                if (keyParam[0] === 'required') {
                    editArea = this.querySelector('section');
                    this.classList.add('required');
                    editArea.setAttribute('required','required');
                }
            }
        }
        return validators;
    }

    _runValidators(element, validators) {
        const unknownValidator = () => {
            return {valid: false, error: 'Unknown validator type: "' + (validator || {}).key + '"'};
        };
        let content = (element.value || element.innerHTML).trim();
        let valid = true;
        let validator= null;
        let func = null;
        let result = null;
        let message = null;

        element.value = content;
        for (let i = 0, len = validators.length; i < len; i++) {
            validator = validators[i];
            func = this.validations['_' + validator.key] || unknownValidator;

            result = func(content, validator.param);
            if (result.valid !== true) {
                valid = false;
                message = result.error;
                break;
            }
        }

        if (valid === true) {
            element.parentNode.classList.remove(this._errorWysiwygClass);
            element.parentNode.querySelectorAll('.error-container').item(0).innerHTML = '';
        } else {
            element.parentNode.classList.add(this._errorWysiwygClass);
            element.parentNode.querySelectorAll('.error-container').item(0).innerHTML = message;
        }
        this.isValid = valid;
        valid? element.setAttribute('valid','') : element.removeAttribute('valid');
    }

    setValidation() {
        let validators = [];
        const textarea = this.querySelector('textarea');
        let editarea = this.querySelector('section.dmb-wysiwyg__content-content');
        validators = this.buildValidators();

        textarea.addEventListener('blur', () => {
            this._runValidators(textarea, validators);
        }, true);

        editarea.addEventListener('blur', () => {
            this._runValidators(editarea, validators);
        }, true);

        document.body.addEventListener(window.dmbEventsService.validate.listener, () => {
            this._runValidators(textarea, validators);
            this._runValidators(editarea, validators);
        }, true);

        document.body.addEventListener(window.dmbEventsService.resetValidation.listener, () => {
            let elements = this.getElementsByClassName(this._errorWysiwygClass);

            for (let i = 0; elements.length; i++) {
                elements.item(0).classList.remove(this._errorWysiwygClass);
            }
        }, true);
    }

    syncData() {
        let textArea = this.querySelector('textarea.dmb-wysiwyg__content-content');
        let editArea = this.querySelector('section.dmb-wysiwyg__content-content');

        if (textArea.hasAttribute('hidden')) {
            textArea.value = editArea.innerHTML;
        } else {
            editArea.innerHTML = textArea.value; 
        }
    }
}
customElements.define('dmb-wysiwyg', DmbWysiwyg);
