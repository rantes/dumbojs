
class DmbWysiwyg extends DumboDirective {
    static get observedAttributes() { return ['valid','name', 'validate', 'dmb-name']; }

    constructor() {
        super();

        const template = '<section id="{{id}}" class="dmb-wysiwyg {{dmbClass}}" >' +
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
                                '<a href="#" title="View compiled" class="dmb-wysiwyg__toolbar-button normal-button" data-command="normal" style="display:none;width:4em;">Normal</a>' +
                            '</div>' +
                            '<textarea class="dmb-wysiwyg__content-content" name="" hidden></textarea>' +
                            '<section class="dmb-wysiwyg__content-content" contenteditable transclude>' +
                            '</section>' +
                        '</section>';

        this.setTemplate(template);
        this.isValid = false;
        this.colorPalette = ['000000', 'FF9966', '6699FF', '99FF66','CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
        this.toolbarElements = [];
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

        this.toolbarElements = this.querySelectorAll('a.dmb-wysiwyg__toolbar-button');

        textArea.setAttribute('hidden', true);
        textArea.value = this.querySelector('section.dmb-wysiwyg__content-content').innerHTML;
        textArea.setAttribute('dmb-name',this.getAttribute('dmb-name') || '');
        textArea.setAttribute('validate',this.getAttribute('validate') || '');
        textArea.setAttribute('valid','true');

        hideButtons = () => {
            let toolbarElements = this.querySelectorAll('.dmb-wysiwyg__toolbar-button');
            for (let j = 0; j < toolbarElements.length; j++) {
                toolbarElements[j].style.display = 'none';
            }
        };

        showButtons = () => {
            let toolbarElements = this.querySelectorAll('.dmb-wysiwyg__toolbar-button');
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
                hideButtons();
                me.parentNode.querySelector('.normal-button').style.display = 'flex';
                textArea = me.parentNode.parentNode.querySelector('textarea.dmb-wysiwyg__content-content');
                editArea = me.parentNode.parentNode.querySelector('section.dmb-wysiwyg__content-content');

                textArea.value = editArea.innerHTML;
                textArea.setAttribute('hidden', false);
                textArea.removeAttribute('hidden');
                editArea.setAttribute('hidden', true);
                break;
            case 'normal':
                showButtons();
                me.style.display = 'none';
                textArea = me.parentNode.parentNode.querySelector('textarea.dmb-wysiwyg__content-content');
                editArea = me.parentNode.parentNode.querySelector('section.dmb-wysiwyg__content-content');

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
    }

    syncData() {
        const textArea = this.querySelector('textarea.dmb-wysiwyg__content-content');
        const editArea = this.parentNode.parentNode.querySelector('section.dmb-wysiwyg__content-content');

        if (textArea.hasAttrobute('hidden')) {
            textArea.value = editArea.innerHTML;
        }
    }
}

customElements.define('dmb-wysiwyg', DmbWysiwyg);
