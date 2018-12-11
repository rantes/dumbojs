/**
 * @todo everything
 */

(function() {
    'use strict';

    dumbo.directive('dmbButton', [], Directive);

    function Directive() {
        var template = '<div id="{{dmbId}}" class="dmb-button {{dmbClass}}" >' +
                            '<span class="text">' +
                            '<transclude></transclude>' +
                            '</span>' +
                       '</div>';

        return {
            scope: {
                dmbClass: '@',
                dmbClick: '&',
                icon: '@',
                dmbId: '@'
            },
            build: function(dom, scope) {
                if (scope.icon) {
                    let element = (new DOMParser()).parseFromString('<i class="icon icon-' + scope.icon + '"></i>', 'text/html').getElementsByTagName('body').item(0).firstChild;

                    dom.prepend(element);
                    dom.classList.add('button-with-icon');
                }

                if (scope.dmbClick) {
                    dom.addEventListener('click', scope.dmbClick);
                }
            },
            template: template
        };
    }
})();
