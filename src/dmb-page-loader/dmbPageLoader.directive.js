
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
    }

}
customElements.define('dmb-page-loader', DmbPageLoader);
