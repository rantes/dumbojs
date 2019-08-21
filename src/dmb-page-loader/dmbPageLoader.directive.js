
class DmbPageLoader extends DumboDirective {
    constructor() {
        super();
        
        window.addEventListener('beforeunload', () => {
            this.classList.add('active');
        });

        document.addEventListener('readystatechange', () => setTimeout(
            () => {
                (document.readyState === 'complete') && (this.classList.remove('active'));
            }, 500
        ));

        window.addEventListener(window.dmbEventsService.pageLoaderClose.listener, () => this.classList.remove('active'));
    }

}
customElements.define('dmb-page-loader', DmbPageLoader);