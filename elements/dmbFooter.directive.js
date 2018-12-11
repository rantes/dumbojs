(function() {
    'use strict';

    dumbo.directive('dmbFooter', [], Directive);

    function Directive() {
        var template = '<footer>' +
                            '<div class="dmb-footer {{dmbClass}}">' +
                                '<transclude></transclude>' +
                            '</div>' +
                       '</footer>';

        return {
            template: template,
            scope: {
                dmbClass: '@'
            },
            build: function(dom) {
                let view = dom.parentElement;

                view.classList.add('padded-footer');
            }
        };
    }
})();
