/**
 * @todo everything
 */

(function() {
    'use strict';

    dumbo.parser('dmbButton', [], Builder);

    function Builder() {
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
                dom.on('click', scope.dmbClick);
            },
            template: template
        };
    }
})(jQuery);
