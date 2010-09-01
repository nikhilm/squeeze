# Squeeze

Squeeze is a library to access the [UploadJuicer](http://uploadjuicer.com) API from [node.js](http://nodejs.org).

It supports both push URL notifications or a polling mechanism to notify your application when an image operation is done.

Example usage:

    var squeeze = require('squeeze');

    squeeze.API_KEY = 'Your key';
    var s = new squeeze.Squeeze('Image URL');
    s.output('size', '100x100>')
     .poll(function(err, data) {
         // data is parsed JSON reply
         console.log("Transformed image is at " + data.outputs[0].url);
    });

## Status

* Supports one operation per image.
* Supports poll based notification of jobs.

## Requirements

You will need an [UploadJuicer API key](http://www.uploadjuicer.com/plans) to use Squeeze.

## Installation and Usage

Simply include the library in your application and `require()` it or use [npm](http://npmjs.org).

For usage please see `API.md` and the examples -- `example/polling.js`.
