# ES7 async wrapper for csv package #

This is a wrapper for the popular `csv` package in NPM that can be used with the ES7 async-await pattern, instead of using callbacks.

## If you just want to read a CSV file ##

```js
const csv = require('async-csv');
const fs = require('fs').promises;

(async() => {
  // Read file from disk:
  const csvString = await fs.readFile('./test.csv', 'utf-8');

  // Convert CSV string into rows:
  const rows = await csv.parse(csvString);
})();
```

## Documentation ##

For all documentation, please see the documentation for the [csv package](https://www.npmjs.com/package/csv).

## Usage examples ##

All parameters are the same as for the functions in the `csv` module, except that you need to omit the callback parameter.

If there is any error returned by the `csv` package, an exception will be thrown.

```js
const csv = require('async-csv');

 // `options` are optional
let result1 = await csv.generate(options);
let result2 = await csv.parse(input, options);
let result3 = await csv.transform(data, handler, options);
let result4 = await csv.stringify(data, options);
```

## Feedback ##

Feedback, bug reports and pull requests are welcome. See the linked Github repository.
