# Dumbo JS

Template Engine component for full stack or static pages. Can be integrated with any backend tecnology, simply quickly light and faster.

This is a complement/side development with [DumboPHP](https://github.com/rantes/DumboPHP)


## Sample of creation
```
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

```

## Sample of implementation

```
<body>
    <div>
        <dmb-button></dmb-button>
    </div>
</body>
```
