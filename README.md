# Dumbo JS

Template Engine component for full stack or static pages. Can be integrated with any backend tecnology, simply quickly light and faster.

This is a complement/side development with [DumboPHP](https://github.com/rantes/DumboPHP)

### Setup:
Download the dist files and put it on your project folder of you desire.
A sample can be like that:
```
        |-- webfiles
        |	|-- dumbojs
        |		|-- dmb-components.min.js
        |		|-- dmb-factories.min.js
        |		|-- dmb-styles.css
        |		|-- dumbo.min.js
        |   |-- your-library
        |       |-- components.js
        |       |-- factories.js
```
then, invoke these files in your html:
```
<!DOCTYPE html>
<html>
<head>
<!-- bring the styles first -->
<link href="dmb-styles.css" rel="stylesheet">
...
</head>
<body>
    <div>
        <!-- just use your components -->
        <dmb-example>
            <span>This is an example</span>
        </dmb-example>
    </div>
    <!-- then load the js files, main dumbo library first -->
    <script src="/webfiles/dumbojs/dumbo.min.js"></script>
    <!-- then load the factories js files. This is very important, the factories must be loaded before of any component -->
    <script src="/webfiles/dumbojs/dmb-factories.min.js"></script>
    <script src="/webfiles/your-library/factories.js"></script>
    <!-- finally, load the components -->
    <script src="/webfiles/dumbojs/dumbo.min.js"></script>
    <script src="/webfiles/your-library/components.js"></script>
</body>
```
You can use any scripting tool to minify/bundle your components but you can use the script `builder.php`. To do so, just copy it into
your project folder, set a `dumbojs.conf.json` and run the script `php builder.php build`

```
//dumbojs.conf.json -- dumbo js file config
{
    "src": "./src/",
    "target": "./dist/",
    "tests": "./tests/"
}
```

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

customElements.define('dmb-example', DmbExample);

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