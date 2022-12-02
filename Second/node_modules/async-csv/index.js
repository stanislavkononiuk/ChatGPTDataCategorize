/**
 * @fileoverview ES7 async wrapper for the csv package.
 */

'use strict';

const csv = require('csv');

class CsvAsync {
  /**
   * @param {object} [options]
   * @param {number} options.seed
   * @param {number} options.columns
   * @param {number} options.length
   */
  static generate(options) {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.generate(options, callback)
        : csv.generate(callback);
    });
  }

  /**
   * Parses a CSV file into an array of rows.
   * @param {string} input
   * @param {object} [options]
   */
  static parse(input, options) {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.parse(input, options, callback)
        : csv.parse(input, callback);
    });
  }

  /**
   *
   * @param {string[][]} data
   * @param {function} handler
   * @param {object} [options]
   */
  static transform(data, handler, options) {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.transform(data, handler, options, callback)
        : csv.transform(data, handler, callback);
    });
  }

  /**
   *
   * @param {string[][]} data
   * @param {object} options
   */
  static stringify(data, options) {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.stringify(data, options, callback)
        : csv.stringify(data, callback);
    });
  }
}

module.exports = CsvAsync;
