/**
 * @todo everything
 */

(function() {
    'use strict';

    dumbo.directive('dmbButton', [], Directive);

    function Directive() {
        var template = '<button id="{{id}}" class="{{dmbClass}}">' +
                            '<transclude></transclude>' +
                       '</button>';

        return {
            scope: {
                id: '@',
                dmbClass: '@',
                dmbClick: '='
            },
            build: function(dom, scope) {
                dom.onclick = scope.dmbClick;
            },
            template: template
        };
    }
})();
