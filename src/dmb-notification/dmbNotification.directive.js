
class DmbNotification extends DumboDirective {
    constructor() {
        super();

        const template = '<i class="icon icon-cancel close-notification-button"></i>' +
                        '<dmb-view class="wrapper" transclude>' +
                        '</dmb-view>';

        this.setTemplate(template);
    }

    close() {
        this.remove();
        return true;
    }

    init() {
        const icon = this.querySelector('.close-notification-button');
        icon.addEventListener('click', (e) => {
            e.target.closest('dmb-notification').close();
        });
    }
}
customElements.define('dmb-notification', DmbNotification);