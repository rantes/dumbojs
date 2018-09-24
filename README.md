# Dumbo JS

Template Engine component for full stack or static pages. Can be integrated with any backend tecnology, simply quickly light and faster.

This is a complement/side development with [DumboPHP](https://github.com/rantes/DumboPHP)


## Sample of creation
```
(function() {
    'use strict';

    dumbo.directive('dmbButton', [], Directive);

    function Directive() {
        var template = '<button id="{{dmbId}}" class="{{dmbClass}}">' +
                            '<transclude></transclude>' +
                       '</button>';

        return {
            scope: {
                dmbId: '@',
                dmbClass: '@',
                dmbClick: '='
            },
            build: function(dom, scope) {
                dom.addEventListener('click', scope.dmbClick);
            },
            template: template
        };
    }
})();

```

## Sample of implementation

```
<body>
    <div>
        <dmb-button></dmb-button>
    </div>
</body>
```
