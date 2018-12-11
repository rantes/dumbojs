(function() {
    'use strict';

    dumbo.directive('dmbPagination', [], Directive);

    function Directive() {
        var template = '<div class="dmb-pagination">' +
                            '<transclude></transclude>' +
                        '</div>';

        return {
            scope: {
                filterForm: '@'
            },
            build: function(dom, scope) {
                    dom.addEventListener('click', (e) => {
                        let classes = e.target.getAttribute('class'),
                            form = document.getElementById(scope.filterForm);

                        if (/paginate-(\w+\-)?page/gm.test(classes)) {
                            if (form) {
                                e.preventDefault();
                                form.setAttribute('target', '_self');
                                form.setAttribute('action', e.target.getAttribute('href'));
                                form.submit();
                            }
                        }
                        return false;
                    });
            },
            template: template
        };
    }
})();
