(function() {
    'use strict';

    dumbo.directive('dmbContent', [], Directive);

    function Directive() {
        var template = '<div class="dmb-content">' +
                            '<transclude></transclude>' +
                        '</div>';

        return {
            template: template
        };
    }
})();
