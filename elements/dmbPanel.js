(function() {
    'use strict';

    dumbo.factory('dmbPanel', [], Builder);

    function Builder() {
        var template = '<section class="dmb-panel">' +
                            '<div class="background"></div>' +
                            '<div class="dmb-panel-wrapper {{side}} {{size}}">' +
                            '</div>' +
                        '</section>';

        return {
            scope: {
                open: '=',
                side: '@',
                size: '@',
                dom: {}
            },
            template: template,
            build: function(dom, scope) {
                var wrapper = dom.find('.dmb-panel-wrapper');

                if (!scope.side) {
                    wrapper.addClass = 'right';
                }

                if (!scope.size) {
                    wrapper.addClass = 'small';
                }

                dom.on('click', '.background', function(e) {
                    e.preventDefault();
                    scope.open = false;
                });
            },
            open: function() {
                this.scope.dom.addClass('_active');
            },
            close: function() {
                this.scope.dom.removeClass('_active');
            }
        };
    }
})();
