fis3-parser-babel6
======
> A babel 6 parser for fis3

## How to use

### Install

```shell
npm install fis3-parser-babel6 --save-dev
```

### Add configure to fis-conf.js

```js
// require the parser plugin and specify the parser
fis.require('parser-babel6').parser = require('babel-core');

fis.match('/src/**.js', {
    parser: fis.plugin('babel6', {
        // babel options
    })
});
```

By default, the babel helper api used information is saved to `file.extras.babelHelpers`. If you using `babel-plugin-external-helpers plugin` plugin, you can lookup the used information from file `extras` property.

### Options

* disableBabel - `boolean` `optional`: if the processed file has disableBabel configure with `true`, the parser will ignore this file

* speed - `boolean` `optional`: `experiment`, if you using npm2 to manage the dependencies, you can enable this options to speed up the babel startup time

