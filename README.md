# Dumbo JS

Template Engine component for full stack or static pages. Can be integrated with any backend tecnology, simply quickly light and faster.

This is a complement/side development with [DumboPHP](https://github.com/rantes/DumboPHP)


## Sample of creation
```
class DmbExample extends DumboDirective {
    constructor() {
        super();

        this.setTemplate(
            '<span transclude></span>'
        );
    }
}

```

## Sample of implementation

```
<body>
    <div>
        <dmb-example>This is an example</dmb-example>
    </div>
</body>
```

### renderized:
```
<body>
    <div>
        <dmb-example>
            <span>This is an example</span>
        </dmb-example>
    </div>
</body>
```