(function() {
    'use strict';

    dumbo.parser('dmbPagination', [], Builder);

    function Builder() {
        var template = '<div class="dmb-pagination">' +
                            '<transclude></transclude>' +
                        '</div>';

        function linkPagination(e) {
            var $this = $(e.target);

            e.preventDefault();
            e.data.form.attr('action', $this.attr('href')).submit();
        }

        return {
            scope: {
                filterForm: '@'
            },
            build: function(dom, scope) {
                var form = $('#' + scope.filterForm);

                if (form.length) {
                    form.prop('target', '_self');
                    dom.find('.paginate-page, .paginate-next-page, .paginate-last-page, .paginate-first-page, .paginate-prev-page').on('click', {form: form}, linkPagination);
                }
            },
            template: template
        };
    }
})(jQuery);
