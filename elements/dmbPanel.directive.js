(function() {
    'use strict';

    dumbo.directive('dmbPanel', ['dmbEvents'], Directive);

    function Directive(dmbEvents) {
        var template = '<section class="dmb-panel {{dmbClass}}" id="{{id}}">' +
                            '<div class="dmb-panel-background"></div>' +
                            '<div class="dmb-panel-wrapper {{side}} {{size}}">' +
                                '<transclude></transclude>' +
                            '</div>' +
                        '</section>',
            open = function (dom) {
                    var currentScope = dom.scope();

                    if (currentScope.template) {
                        let xhttp = new XMLHttpRequest();

                        xhttp.onreadystatechange = function() {
                            var wrapper = dom.querySelectorAll('.dmb-panel-wrapper')[0];

                            if (this.readyState == 4 && this.status == 200) {
                                if (!Object.isFrozen(window.location)) {
                                    wrapper.innerHTML = this.responseText;
                                    dom.classList.add('_active');
                                    dom.dispatchEvent(dmbEvents.panelOpened.event);
                                }
                            }
                        };

                        xhttp.open('GET', currentScope.template, true);
                        xhttp.send();
                    } else {
                        dom.classList.add('_active');
                        dom.dispatchEvent(dmbEvents.panelOpened.event);
                    }
                };
        return {
            scope: {
                dmbClass: '@',
                id: '@',
                open: '@',
                side: '@',
                size: '@',
                template: '@',
                title: '@'
            },
            template: template,
            build: function(dom, scope) {
                var wrapper = dom.querySelectorAll('.dmb-panel-wrapper')[0];

                if (!scope.side) {
                    wrapper.classList.add('right');
                }

                if (!scope.size) {
                    wrapper.classList.add('small');
                }

                function close(panel) {
                    panel.classList.remove('_active');
                    panel.dispatchEvent(dmbEvents.panelClosed.event);
                }

                if (scope.open === 'true') {
                    open(dom);
                }

                dom.addEventListener(dmbEvents.panelOpen.listener, (e) => {
                    open(e.target);
                }, true);

                dom.addEventListener(dmbEvents.panelClose.listener, (e) => {
                    close(e.target);
                }, true);

                dom.querySelectorAll('.dmb-panel-background')[0].addEventListener('click', () => {
                    close(dom);
                }, true);

            }
        };
    }
})();
