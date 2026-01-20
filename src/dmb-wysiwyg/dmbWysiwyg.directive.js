import { DumboDirective } from "../dumbo.js";
export class DmbWysiwyg extends DumboDirective {
    static get observedAttributes() { return ['valid','name', 'validate', 'dmb-name']; }

    constructor() {
        super();
        const h1Icon = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g><path d="M11 7h2v10h-2v-4H7v4H5V7h2v4h4V7zm6.57 0c-.594.95-1.504 1.658-2.57 2v1h2v7h2V7h-1.43z"/></g></svg>';
        const h2Icon = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g><path d="M9 7h2v10H9v-4H5v4H3V7h2v4h4V7zm8 8c.51-.41.6-.62 1.06-1.05.437-.4.848-.828 1.23-1.28.334-.39.62-.82.85-1.28.2-.39.305-.822.31-1.26.005-.44-.087-.878-.27-1.28-.177-.385-.437-.726-.76-1-.346-.283-.743-.497-1.17-.63-.485-.153-.99-.227-1.5-.22-.36 0-.717.033-1.07.1-.343.06-.678.158-1 .29-.304.13-.593.295-.86.49-.287.21-.56.437-.82.68l1.24 1.22c.308-.268.643-.502 1-.7.35-.2.747-.304 1.15-.3.455-.03.906.106 1.27.38.31.278.477.684.45 1.1-.014.396-.14.78-.36 1.11-.285.453-.62.872-1 1.25-.44.43-.98.92-1.59 1.43-.61.51-1.41 1.06-2.16 1.65V17h8v-2h-4z"/></g></svg>';
        const h3Icon = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g><path d="M14.11 14.218c.355.287.75.523 1.17.7.434.18.9.273 1.37.27.484.017.965-.086 1.4-.3.333-.146.55-.476.55-.84.003-.203-.05-.403-.15-.58-.123-.19-.3-.34-.51-.43-.32-.137-.655-.228-1-.27-.503-.073-1.012-.106-1.52-.1v-1.57c.742.052 1.485-.07 2.17-.36.37-.164.615-.525.63-.93.026-.318-.12-.627-.38-.81-.34-.203-.734-.3-1.13-.28-.395.013-.784.108-1.14.28-.375.167-.73.375-1.06.62l-1.22-1.39c.5-.377 1.053-.68 1.64-.9.608-.224 1.252-.336 1.9-.33.525-.007 1.05.05 1.56.17.43.1.84.277 1.21.52.325.21.595.495.79.83.19.342.287.73.28 1.12.01.48-.177.943-.52 1.28-.417.39-.916.685-1.46.86v.06c.61.14 1.175.425 1.65.83.437.382.68.94.66 1.52.005.42-.113.835-.34 1.19-.23.357-.538.657-.9.88-.408.253-.853.44-1.32.55-.514.128-1.04.192-1.57.19-.786.02-1.57-.106-2.31-.37-.59-.214-1.126-.556-1.57-1l1.12-1.41zM9 11H5V7H3v10h2v-4h4v4h2V7H9v4z"/></g></svg>';
        const h4Icon = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g><path d="M11 17H9v-4H5v4H3V7h2v4h4V7h2v10zm10-2h-1v2h-2v-2h-5v-2l4.05-6H20v6h1v2zm-3-2V9l-2.79 4H18z"/></g></svg>';
        const h5Icon = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g><path d="M14.09 14.19c.352.27.73.5 1.13.69.42.196.877.296 1.34.29.51.014 1.01-.125 1.44-.4.378-.253.594-.686.57-1.14.02-.45-.197-.877-.57-1.13-.406-.274-.89-.41-1.38-.39h-.47c-.135.014-.27.04-.4.08l-.41.15-.48.23-1.02-.57.28-5h6.4v1.92h-4.31L16 10.76c.222-.077.45-.138.68-.18.235-.037.472-.054.71-.05.463-.004.924.057 1.37.18.41.115.798.305 1.14.56.33.248.597.57.78.94.212.422.322.888.32 1.36.007.497-.11.99-.34 1.43-.224.417-.534.782-.91 1.07-.393.3-.837.527-1.31.67-.497.164-1.016.252-1.54.26-.788.023-1.573-.11-2.31-.39-.584-.238-1.122-.577-1.59-1l1.09-1.42zM11 17H9v-4H5v4H3V7h2v4h4V7h2v10z"/></g></svg>';
        const h6Icon = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g><path d="M11 17H9v-4H5v4H3V7h2v4h4V7h2v10zm8.58-7.508c-.248-.204-.524-.37-.82-.49-.625-.242-1.317-.242-1.94 0-.3.11-.566.287-.78.52-.245.27-.432.586-.55.93-.16.46-.243.943-.25 1.43.367-.33.79-.59 1.25-.77.405-.17.84-.262 1.28-.27.415-.006.83.048 1.23.16.364.118.704.304 1 .55.295.253.528.57.68.93.193.403.302.843.32 1.29.01.468-.094.93-.3 1.35-.206.387-.49.727-.83 1-.357.287-.764.504-1.2.64-.98.31-2.033.293-3-.05-.507-.182-.968-.472-1.35-.85-.437-.416-.778-.92-1-1.48-.243-.693-.352-1.426-.32-2.16-.02-.797.11-1.59.38-2.34.215-.604.556-1.156 1-1.62.406-.416.897-.74 1.44-.95.54-.21 1.118-.314 1.7-.31.682-.02 1.36.096 2 .34.5.19.962.464 1.37.81l-1.31 1.34zm-2.39 5.84c.202 0 .405-.03.6-.09.183-.046.356-.128.51-.24.15-.136.27-.303.35-.49.092-.225.136-.467.13-.71.037-.405-.123-.804-.43-1.07-.328-.23-.72-.347-1.12-.33-.346-.002-.687.07-1 .21-.383.17-.724.418-1 .73.046.346.143.683.29 1 .108.23.257.44.44.62.152.15.337.26.54.33.225.055.46.068.69.04z"/></g></svg>';
        const undoIcon = '<svg width="100%" height="100%" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="undoIconTitle" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000000"> <title id="undo">Undo last action</title> <path d="M8 15H3v-5"/> <path d="M5 13c5-5 12.575-4.275 16 1"/> <path stroke-linecap="round" d="M3 15l2-2"/> </svg>';
        const redoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" /></svg>';
        const pIcon = '<svg width="100%" height="100%" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-paragraph"><path d="M10.5 15a.5.5 0 0 1-.5-.5V2H9v12.5a.5.5 0 0 1-1 0V9H7a4 4 0 1 1 0-8h5.5a.5.5 0 0 1 0 1H11v12.5a.5.5 0 0 1-.5.5z"/></svg>';
        const linkIcon = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 493 493" style="enable-background:new 0 0 493 493;" xml:space="preserve">
   <g>
       <g>
           <path d="M215.6,314.05c6.8,6.6,14.7,12.4,23.5,16.4c2.1,1.2,4.4,1.9,6.7,2.8c2.2,0.9,4.5,1.7,6.9,2.2c2.4,0.6,4.5,1.3,7.1,1.7
               c2.6,0.4,5.2,0.8,7.8,1.1c2,0.2,3.3,0.2,4.9,0.3l2.4,0.1h1.2h2l9.5-0.1l19-0.3l38.1-0.9l38.1-1.1l9.5-0.3l4.8-0.1
               c1.6,0,3.7-0.2,5.5-0.4c7.5-0.4,14.8-2.2,21.9-4.4c26.3-5.2,50.8-24.7,61.6-51.4l2-5l1.5-5.2c1.1-3.3,1.8-7.3,2.4-11.2l0.4-2.9
               l0.2-2.2l0.3-4.3l0.1-1.1v-1.3v-0.3v-0.7l-0.1-2.7l-0.2-5.4c-1.2-14.5-6-28.7-13.6-41.1c-7.6-12.4-18.2-23-30.6-30.6l-4.7-2.8
               c-1.6-0.8-3.3-1.6-4.9-2.4c-3.2-1.7-6.7-2.9-10.1-4.1c-3.4-1.3-7-2-10.5-2.9c-3.7-0.8-8-1.3-11.7-1.7l-4.3-0.2l-2.2-0.1l-2.1-0.1
               h-1.1h-8.7h-17.3c-11.5-0.1-23.1-0.2-34.6-0.5c-4.1-0.1-10.5,3.4-12.6,5.8c-4,4.9,1.2,9,9,12.1c12.9,5.2,27.1,8.9,42.1,11.4
               c7.5,1.3,15.2,2.3,23,3h0.2c0.6,0-0.7,0-0.6,0l0,0l0,0h0.1l0.4,0.1l0.7,0.1l1.5,0.2l2.9,0.4c2.2,0.2,3.4,0.7,4.8,1
               c2.7,0.5,6,1.7,9,2.7c14.7,5.4,26.8,16.6,33.3,30.2c3.3,6.8,5.2,14.1,5.8,21.4c0.6,7.1-0.4,15.8-2.4,21.8
               c-4.1,13.9-13.6,26-25.8,33.5c-6.1,3.8-12.8,6.5-19.9,7.9c-1.8,0.2-3.5,0.8-5.4,0.8l-2.7,0.3c-0.9,0.1-1.7,0.2-3,0.2l-14.4,0.5
               c-9.5-0.4-19-0.7-28.5-1.1c-15.1-0.4-30.2-0.8-45.2-1l-22.6-0.2h-5.7h-2.7h-0.5l-1.4-0.1l-5.5-0.3c-1.1-0.2-2.2-0.4-3.3-0.6
               c-5-1-10.6-2.5-15.5-5c-4.9-2.5-9.6-5.6-13.8-9.3c-4.1-3.8-7.8-8.2-10.9-12.9c-3-4.9-5.3-10.1-7-15.7c-0.4-1.6-0.8-3.2-1.3-4.7
               s-0.7-3.1-1.2-4.5c-1-2.9-1.7-5.7-2.8-8.1c-2-4.8-4.6-8.4-9.2-8.7c-4.1-0.3-8.5,2.3-11.6,8.1c-1.6,2.9-2.8,6.5-3.3,10.7
               c-0.8,4.2-0.6,9,0.1,14.1C193.1,283.05,201.8,300.75,215.6,314.05z"/>
           <path d="M65.7,198.45c6.1-3.8,12.8-6.5,19.9-7.9c1.8-0.2,3.5-0.8,5.4-0.8l2.7-0.2c0.9-0.1,1.7-0.2,3-0.2l14.4-0.5
               c9.5,0.4,19,0.7,28.5,1.1c15.1,0.4,30.2,0.8,45.2,1l22.6,0.2h5.7h2.7h0.5l1.4,0.1l5.5,0.3c1.1,0.2,2.2,0.4,3.3,0.6
               c5,1,10.6,2.5,15.5,5s9.6,5.6,13.8,9.3c4.1,3.8,7.8,8.2,10.9,12.9c3,4.9,5.3,10.1,7,15.7c0.4,1.6,0.8,3.2,1.3,4.7s0.7,3.1,1.2,4.5
               c1,2.9,1.7,5.7,2.8,8.1c2,4.8,4.6,8.4,9.2,8.7c4.1,0.3,8.5-2.3,11.6-8.1c1.6-2.9,2.8-6.5,3.3-10.7c0.8-4.2,0.6-9-0.1-14.1
               c-3-18.2-11.8-36-25.6-49.2c-6.8-6.6-14.7-12.4-23.5-16.4c-2.1-1.2-4.4-1.9-6.7-2.8c-2.2-0.9-4.5-1.7-6.9-2.2
               c-2.4-0.6-4.5-1.3-7.1-1.7s-5.2-0.8-7.8-1.1c-2-0.2-3.3-0.2-5-0.3l-2.4-0.1h-1.2h-2l-9.5,0.1l-19,0.3l-38.1,0.9l-38.1,1.1
               l-9.5,0.3l-4.8,0.1c-1.6,0-3.7,0.2-5.4,0.4c-7.5,0.4-14.8,2.2-21.9,4.4c-26.3,5.2-50.8,24.7-61.6,51.4l-2,5l-1.5,5.2
               c-1.1,3.3-1.8,7.3-2.4,11.2l-0.4,2.9l-0.2,2.2l-0.3,4.3l-0.1,1.1v1.3v0.3v0.7l0.1,2.7l0.2,5.4c1.2,14.5,6,28.7,13.6,41.1
               s18.2,23,30.6,30.6l4.7,2.8c1.6,0.8,3.3,1.6,4.9,2.4c3.2,1.7,6.7,2.9,10.1,4.1c3.4,1.3,7,2,10.5,2.9c3.7,0.8,8,1.3,11.7,1.7
               l4.3,0.2l2.2,0.1l2.1,0.1h1.1h8.7h17.3c11.5,0.1,23.1,0.2,34.6,0.5c4.1,0.1,10.5-3.4,12.6-5.8c4-4.9-1.2-9-9-12.1
               c-12.9-5.2-27.1-8.9-42.1-11.4c-7.5-1.3-15.2-2.3-23-3H95c-0.6,0,0.7,0,0.6,0l0,0l0,0h-0.1l-0.4-0.1l-0.7-0.1l-1.5-0.2l-2.9-0.4
               c-2.2-0.2-3.4-0.7-4.8-1c-2.7-0.5-6-1.7-9-2.7c-14.7-5.4-26.8-16.6-33.3-30.2c-3.3-6.8-5.2-14.1-5.8-21.4
               c-0.6-7.1,0.4-15.8,2.4-21.8C44.1,218.05,53.5,206.05,65.7,198.45z"/>
       </g>
   </g>
</svg>`;
        const justifyCenterIcon = '<svg width="100%" height="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="32" x="16" y="63.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="151.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="239.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="327.998" fill="var(--primary)"/><rect width="320" height="32" x="96" y="415.998" fill="var(--primary)"/></svg>';
        const justifyLeftIcon = '<svg width="100%" height="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="32" x="16" y="63.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="151.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="239.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="327.998" fill="var(--primary)"/><rect width="320" height="32" x="16" y="415.998" fill="var(--primary)"/></svg>';
        const justifyRightIcon = '<svg width="100%" height="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="32" x="16" y="63.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="151.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="239.998" fill="var(--primary)"/><rect width="480" height="32" x="16" y="327.998" fill="var(--primary)"/><rect width="320" height="32" x="176" y="415.998" fill="var(--primary)"/></svg>';
        const justifyFullIcon = '<svg width="100%" height="100%" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:none;}</style></defs><title>text--align--justify</title><rect x="6" y="6" width="20" height="2"/><rect x="6" y="12" width="20" height="2"/><rect x="6" y="18" width="20" height="2"/><rect x="6" y="24" width="20" height="2"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>';
        const superIcon = '<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"/><path d="M11 7v13H9V7H3V5h12v2h-4zm8.55-.42a.8.8 0 1 0-1.32-.36l-1.154.33A2.001 2.001 0 0 1 19 4a2 2 0 0 1 1.373 3.454L18.744 9H21v1h-4V9l2.55-2.42z"/></g></svg>';
        const backgroundIcon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve">
    <g>
        <path d="M29,27H3c-0.6,0-1,0.4-1,1s0.4,1,1,1h26c0.6,0,1-0.4,1-1S29.6,27,29,27z"/>
        <path d="M6.4,16.7C6.4,16.7,6.4,16.7,6.4,16.7l7,7c0.2,0.2,0.4,0.3,0.7,0.3s0.5-0.1,0.7-0.3l6.9-6.9c0,0,0,0,0,0l1.5-1.5
            c0.4-0.4,0.4-1,0-1.4l-8.9-9c0,0,0,0,0,0l-2.5-2.5c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l1.8,1.8l-7.7,7.7c-0.4,0.4-0.4,1,0,1.4
            L6.4,16.7z M13.6,7L14,7.5c0,0,0,0,0,0l7,7L20.6,15H7.5l-1-1L13.6,7z"/>
        <path d="M25,24c1.7,0,3-1.3,3-3c0-1.4-1.8-3.2-2.3-3.7c-0.4-0.4-1-0.4-1.4,0C23.8,17.8,22,19.6,22,21C22,22.7,23.3,24,25,24z"/>
    </g>
</svg>`;
        const fontColorIcon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 485 485" style="enable-background:new 0 0 485 485;" xml:space="preserve">
   <g>
       <path d="M413.974,71.026C368.171,25.225,307.274,0,242.5,0C177.726,0,116.829,25.225,71.027,71.026
           C25.225,116.829,0,177.726,0,242.5c0,64.774,25.225,125.671,71.027,171.473S177.726,485,242.5,485H288
           c33.359,0,60.5-27.14,60.5-60.5c0-33.359-27.14-60.499-60.5-60.5c-16.817,0-30.5-13.682-30.5-30.5c0-16.817,13.683-30.5,30.5-30.5
           h136.5c33.359,0,60.5-27.14,60.5-60.5C485,177.726,459.775,116.829,413.974,71.026z M424.5,273H288c-33.359,0-60.5,27.14-60.5,60.5
           c0,33.36,27.141,60.5,60.499,60.5c16.818,0,30.501,13.683,30.501,30.5c0,16.818-13.683,30.5-30.5,30.5h-45.5
           C125.327,455,30,359.673,30,242.5S125.327,30,242.5,30S455,125.327,455,242.5C455,259.318,441.317,273,424.5,273z"/>
       <path d="M105,207.5c-19.299,0-35,15.701-35,35s15.701,35,35,35s35-15.701,35-35S124.299,207.5,105,207.5z"/>
       <path d="M328.75,93.111c-5.316-3.07-11.362-4.693-17.481-4.693c-12.475,0-24.097,6.707-30.329,17.503
           c-4.675,8.096-5.917,17.529-3.497,26.56c2.42,9.03,8.211,16.577,16.308,21.252c5.317,3.07,11.361,4.692,17.48,4.692
           c12.476,0,24.098-6.707,30.33-17.503c4.675-8.096,5.917-17.529,3.497-26.559S336.847,97.786,328.75,93.111z"/>
       <path d="M173.731,88.418c-6.119,0-12.165,1.623-17.481,4.693c-8.096,4.674-13.888,12.222-16.308,21.252
           c-2.419,9.03-1.178,18.462,3.497,26.558c6.233,10.797,17.855,17.504,30.33,17.504c6.119,0,12.164-1.623,17.481-4.692
           c8.097-4.674,13.888-12.222,16.308-21.252c2.419-9.03,1.178-18.462-3.497-26.558C197.828,95.125,186.207,88.418,173.731,88.418z"/>
   </g>
</svg>`;

        const template = '<section class="dmb-wysiwyg" >' +
                            '<div class="dmb-wysiwyg__toolbar">' +
                                `<a href="#" title="Heading 1" class="dmb-wysiwyg__toolbar-button" data-command="h1">${h1Icon}</a>` +
                                `<a href="#" title="Heading 2" class="dmb-wysiwyg__toolbar-button" data-command="h2">${h2Icon}</a>` +
                                `<a href="#" title="Heading 3" class="dmb-wysiwyg__toolbar-button" data-command="h3">${h3Icon}</a>` +
                                `<a href="#" title="Heading 4" class="dmb-wysiwyg__toolbar-button" data-command="h4">${h4Icon}</a>` +
                                `<a href="#" title="Heading 5" class="dmb-wysiwyg__toolbar-button" data-command="h5">${h5Icon}</a>` +
                                `<a href="#" title="Heading 6" class="dmb-wysiwyg__toolbar-button" data-command="h6">${h6Icon}</a>` +
                                `<a href="#" title="Undo" class="icon icon-undo dmb-wysiwyg__toolbar-button" data-command="undo">${undoIcon}</a>` +
                                `<a href="#" title="Redo" class="icon icon-redo dmb-wysiwyg__toolbar-button" data-command="redo">${redoIcon}</a>` +
                                `<a href="#" title="Paragraph" class="icon icon-pilcrow dmb-wysiwyg__toolbar-button" data-command="p">${pIcon}</a>` +
                                `<a href="#" title="Link" class="icon icon-link dmb-wysiwyg__toolbar-button" data-command="createlink">${linkIcon}</a>` +
                                `<a href="#" title="Left Align" class="icon icon-paragraph-left dmb-wysiwyg__toolbar-button" data-command="justifyLeft">${justifyLeftIcon}</a>` +
                                `<a href="#" title="Center Align" class="icon icon-paragraph-center dmb-wysiwyg__toolbar-button" data-command="justifyCenter">${justifyCenterIcon}</a>` +
                                `<a href="#" title="Justify Align" class="icon icon-paragraph-justify dmb-wysiwyg__toolbar-button" data-command="justifyFull">${justifyFullIcon}</a>` +
                                `<a href="#" title="right Align" class="icon icon-paragraph-right dmb-wysiwyg__toolbar-button" data-command="justifyRight">${justifyRightIcon}</a>` +
                                `<a href="#" title="Super" class="icon icon-superscript2 dmb-wysiwyg__toolbar-button" data-command="superscript">${superIcon}</a>` +
                                '<div title="Font Color" class="dmb-wysiwyg__toolbar-button palette">' +
                                    `${fontColorIcon}` +
                                    '<div class="fore-palette"></div>' +
                                '</div>' +
                                '<div title="Background Color" class="dmb-wysiwyg__toolbar-button back-palette">' +
                                    `${backgroundIcon}` +
                                    '<div class="fore-palette"></div>' +
                                '</div>' +
                                '<a href="#" title="View Source" class="dmb-wysiwyg__toolbar-button source-button" data-command="source" style="width: 4em;">Source</a>' +
                                '<a href="#" title="View compiled" class="dmb-wysiwyg__toolbar-button normal-button" data-command="normal" style="display:none;">Normal</a>' +
                            '</div>' +
                            '<textarea class="dmb-wysiwyg__content-content novalidate"></textarea>' +
                            '<section class="dmb-wysiwyg__content-content novalidate" contenteditable transclude>' +
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
        let form = this.closest('dmb-form') || this.closest('form');

        this.toolbarElements = this.querySelectorAll('.dmb-wysiwyg__toolbar-button');
        if (form) {
            form.addEventListener('submit', () => {
                this.syncData();
            });
        }

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
        textArea.setAttribute('name',this.getAttribute('dmb-name') || '');
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
            let selection = null;

            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            switch (command) {
            case 'h1':
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
                document.execCommand(command, true, `#${value}`);
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

                textArea.value = editArea.innerHTML;
                textArea.setAttribute('hidden', false);
                textArea.removeAttribute('hidden');
                editArea.setAttribute('hidden', true);
                break;
            case 'normal':
                showButtons(this.toolbarElements);
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

        if (this.getAttribute('validate') && this.getAttribute('validate').length) {
            this.setValidation();
        }
    }

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
        const textarea = this.querySelector('textarea.dmb-wysiwyg__content-content');
        const editarea = this.querySelector('section.dmb-wysiwyg__content-content');
        validators = this.buildValidators();

        textarea.addEventListener('blur', () => {
            this._runValidators(textarea, validators);
        }, true);

        editarea.addEventListener('blur', () => {
            this._runValidators(editarea, validators);
        }, true);

        document.body.addEventListener(window.DmbEvents.validate.listener, () => {
            this._runValidators(textarea, validators);
            this._runValidators(editarea, validators);
        }, true);

        document.body.addEventListener(window.DmbEvents.resetValidation.listener, () => {
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

    attributeChangedCallback(attr, oldValue, newValue) {
        const textarea = this.querySelector('textarea.dmb-wysiwyg__content-content');
        const editarea = this.querySelector('section.dmb-wysiwyg__content-content');

        switch(attr) {
        case 'valid':
            this.isValid = (newValue !== null);
            break;
        case 'name':
            if (textarea) textarea.setAttribute('name',newValue);
            break;
        case 'dmb-name':
            if (textarea) textarea.setAttribute('name',newValue);
            break;
        case 'validate':
            if (textarea) {
                textarea.setAttribute('validate',newValue);
                if (newValue && newValue.length) {
                    this.setValidation();
                }
            }
            if (editarea) {
                editarea.setAttribute('validate',newValue);
                if (newValue && newValue.length) {
                    this.setValidation();
                }
            }
            break;
        }
    }
}
