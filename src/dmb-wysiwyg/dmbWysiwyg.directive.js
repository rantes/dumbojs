
class DmbWysiwyg extends DumboDirective {
    static get observedAttributes() { return ['valid','name', 'validate', 'dmb-name']; }

    constructor() {
        super();

        const template = '<section id="{{id}}" class="dmb-wysiwyg {{dmbClass}}" >' +
                            '<div class="dmb-wysiwyg__toolbar">' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="h2">H2</a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="h3">H3</a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="h4">H4</a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="h5">H5</a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="h6">H6</a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="undo"><i class="icon icon-undo"></i></a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="redo"><i class="icon icon-redo"></i></a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button">' +
                                    '<i class="icon icon-brush"></i>' +
                                    '<a href="#" class="fore-palette"></a>' +
                                '</a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="createlink"><i class="icon icon-link"></i></a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="justifyLeft"><i class="icon icon-paragraph-left"></i></a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button" data-command="superscript"><i class="icon icon-superscript2"></i></a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button source-button" data-command="source">Source</a>' +
                                '<a href="#" class="dmb-wysiwyg__toolbar-button normal-button" data-command="normal" style="display:none;">Normal</a>' +
                            '</div>' +
                            '<section class="dmb-wysiwyg__content-content" contenteditable transclude>' +
                            '</section>' +
                        '</section>';

        this.setTemplate(template);
        this.isValid = false;
        this.colorPalette = ['000000', 'FF9966', '6699FF', '99FF66','CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
        this.toolbarElements = [];
    }

    init() {
        const forePalette = this.querySelector('.fore-palette');
        let hideButtons = null;
        let showButtons = null;
        let executeCommand = null;

        for (let i = 0; i < this.colorPalette.length; i++) {
            let a = document.createElement('div');

            a.dataset.command = 'forecolor';
            a.dataset.value = `#${this.colorPalette[i]}`;
            a.style.backgroundColor = `#${this.colorPalette[i]}`;
            a.classList.add('palette-item');
            a.classList.add('dmb-wysiwyg__toolbar-button');
            forePalette.append(a.cloneNode(true));
            a = null;
        }

        this.toolbarElements = this.querySelectorAll('.dmb-wysiwyg__toolbar-button');

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

            e.preventDefault();

            switch (command) {
            case 'h2':
            case 'h3':
            case 'h4':
            case 'p':
                document.execCommand('formatBlock', false, command);
                break;
            case 'forecolor':
            case 'backcolor':
                document.execCommand(command, false, value);
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
                textArea = document.createElement('textarea');
                editArea = me.parentNode.parentNode.querySelector('.dmb-wysiwyg__content-content');

                textArea.classList.add('dmb-wysiwyg__content-content');
                textArea.value = editArea.innerHTML;
                editArea.parentNode.replaceChild(textArea, editArea);
                break;
            case 'normal':
                showButtons(this.toolbarElements);
                me.style.display = 'none';
                editArea = document.createElement('div');
                textArea = me.parentNode.parentNode.querySelector('.dmb-wysiwyg__content-content');

                editArea.classList.add('dmb-wysiwyg__content-content');
                editArea.setAttribute('contenteditable', true);
                editArea.innerHTML = textArea.value;
                textArea.parentElement.replaceChild(editArea, textArea);
                break;
            default:
                document.execCommand(command, false, null);
                break;
            }

        };

        for (let i = 0; i < this.toolbarElements.length; i++) {
            this.toolbarElements[i].addEventListener('click', executeCommand);
        }
    }
}
customElements.define('dmb-wysiwyg', DmbWysiwyg);
