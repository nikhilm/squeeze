Squeeze API
===========

The Squeeze API is primarily based on the `squeeze.Squeeze` class.

Before you begin using it, setup squeeze.

    var squeeze = require('/path/to/squeeze');
    squeeze.API_KEY = 'YOUR UploadJuicer API key'

## Squeeze

All operations are done via the `Squeeze` class. For now only one operation is supported per instance.

Create a new Squeeze passing the URL of the image to convert

    var s = new squeeze.Squeeze('http://farm5.static.flickr.com/4116/4774485856_e9aa9d81cf_b.jpg');

### Squeeze.op(operation, value)

Use `Squeeze.op` to queue up an operation to be performed on the image. For example, to resize
the image

    // resize 100x100
    s.op('size', '100x100>')

`Squeeze.op` returns the object itself, so that you can chain multiple calls, although that isn't supported yet.
For boolean operations, you can skip the `value` argument and it will be set to `true`.

### Squeeze.and(operation, value)

`Squeeze.op` creates a new image for every operation. If you want to perform multiple operations on the same image,
say flip it first and then resize it, then you use `Squeeze.and`.

    // enhance followed by flop
    s.op('enhance')
      .and('flop')

`Squeeze.and` takes the same parameters as `Squeeze.op`.

## Performing the operation

Once the `Squeeze` instance is set up, you can perform the actual operation using two modes, polling or notification.

### Squeeze.poll(callback)

This method submits the job and then polls the UploadJuicer service every 5 seconds to check the status of the job.
The callback function is executed with the results when the job is completed. If any errors occur, `err` will describe
the error and `data` may or may not be meaningful. If no errors occur and the job finishes successfully, `err` will be `null`
and `data` will be a JavaScript object as parsed from the reply defined by [the UploadJuicer API](http://app.uploadjuicer.com/guides/getting_started)

The callback function should be `function (err, data) {}`.

    s.poll(function (err, data) {
        if(err)
            console.error(err);
        else
            console.log("Finished:", sys.inspect(data));
    });

### Squeeze.notify()

**NOT IMPLEMENTED**

This utilizes UploadJuicer's capability to POST data to your custom URL when the job is done and avoids having to poll the server.
This is not yet implemented by Squeeze.
