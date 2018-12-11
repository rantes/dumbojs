(function() {
    'use strict';

    dumbo.directive('dmbView', [], Directive);

    function Directive() {
        var template = '<section class="dmb-view">' +
                                '<transclude></transclude>' +
                       '</section>';

        return {
            template: template
        };
    }
})();
