(function() {
    'use strict';

    dumbo.directive('dmbHeader', [], Directive);

    function Directive() {
        var template = '<header>' +
                            '<div class="dmb-header">' +
                                '<transclude></transclude>' +
                            '</div>' +
                       '</header>';

        return {
            scope: {
                title: '@'
            },
            template: template,
            build: function(dom, scope) {
                let parser = new DOMParser(),
                    header = dom.querySelector('.dmb-header'),
                    title = parser.parseFromString('<h2 class="dmb-header-title">' + scope.title + '</h2>', 'text/html').getElementsByTagName('body').item(0).firstChild,
                    view = dom.parentElement;

                if (scope.title) {
                    header.insertBefore(title, header.firstChild);
                }

                view.classList.add('padded-header');
            }
        };
    }
})();
