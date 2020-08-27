
class DmbPagination extends DumboDirective {
    constructor() {
        super();
    }

    init() {
        const formTarget = this.getAttribute('filter-form') || '';
        
        this.addEventListener('click', e => {
            const target = e.target;
            const classes = target.getAttribute('class');
            const form = document.querySelector(formTarget);

            if (/paginate-(\w+-)?page/gm.test(classes)) {
                if (form) {
                    e.preventDefault();
                    form.setAttribute('action', e.target.getAttribute('href'));
                    form.submit();
                }
            }
        });
    }
}

customElements.define('dmb-pagination', DmbPagination);