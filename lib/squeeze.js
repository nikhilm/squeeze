var sys = require('sys')
  , http = require('http')
  , url = require('url')
  , path = require('path')


/************************
 * CONSTANTS
 ***********************/
exports.API_KEY = '';

var ENDPOINT_HOST = 'app.uploadjuicer.com';
var ENDPOINT_PATH = '/jobs';

var ujUrl = function (morePath) {
    var obj = { pathname: ENDPOINT_PATH
              , query: 'token=' + exports.API_KEY
              };
    if( morePath ) {
        obj.pathname = path.join(obj.pathname, morePath);
    }

    return url.format(obj);
}

// data is a list of operations to be performed
var createRequest = function(path, data, cb, method) {
    var opString = data ? JSON.stringify(data) : "";

    var client = http.createClient(80, ENDPOINT_HOST);
    var request = client.request(method || 'POST'
                                , ujUrl(path)
                                , { 'Host': ENDPOINT_HOST
                                  , 'Content-Type': 'application/json'
                                  , 'Accept': 'application/json'
                                  , 'Content-Length': opString.length
                                  }
                                );
    request.write(opString);
    request.end();
    request.on('response', cb);
    return request;
}

var aggregate = function (response, cb) {
    var data = '';
    var data = '';
    response.on('data', function (chunk) {
        data += chunk.toString();
    });
    response.on('end', function() {
        cb(data);
    });
}

var startPoll = function (reply, cb, interval) {
    console.log("Starting poll on " + reply.id);
    setTimeout(function () {
        createRequest(reply.id, null, function (response) {
            aggregate(response, function (data) {
                console.log("Poll received reply ");
                console.dir(data);
                var job = JSON.parse(data);
                // TODO check proper parse
                if( job.status == 'failed' ) {
                    cb('failed', job);
                }
                else if( job.status == 'finished' ) {
                    cb(null, job);
                }
                else if( job.status == 'queued' ) {
                    startPoll(reply, cb, interval);
                }
            });
        }, 'GET').on('error', function (err) {
            cb(err);
        });
    }, interval || 5000);
}

/**
 * Create a new UploadJuicer operation using a URL
 */
exports.Squeeze = function(url) {
    this.description = { 'url': url
                       , 'outputs': []
                       };
}

var addOp = function (obj, op, value) {
    obj[op] = value ? value : true;
}

/**
 * Begins a new output image on the original image.
 *
 * This performs a 'parallel' operation: every call to op will result in a different output image.
 *
 * @param op - name of operation to perform (eg. resize, flip)
 * @param value - (optional) a string value. It may be skipped for boolean operations
 */
exports.Squeeze.prototype.op = function (op, value) {
    var x = {};
    addOp(x, op, value);
    this.description['outputs'].push(x);
    return this;
}

/**
 * Applies the image operation (op, value) on the last output image added.
 *
 * This overlays the operation onto the existing image, effectively executing
 * two or more operations and then giving the output.
 *
 * Parameters are the same as @c Squeeze.op
 */
exports.Squeeze.prototype.and = function (op, value) {
    if(this.description['outputs'].length == 0)
        return this.op(op, value);
    var outputs = this.description['outputs'];
    addOp(outputs[outputs.length-1], op, value);
    return this;
}

exports.Squeeze.prototype.poll = function (cb) {
    console.log("Performing poll");
    console.dir(this.description);
    var request = createRequest('', this.description, function(response) {
        aggregate(response, function (data) {
            var reply = JSON.parse(data);
            console.dir(reply);
            if( !reply ) {
                cb('Invalid Reply', data);
            }
            else if( !reply.status ) {
                cb('Unknown Error', data);
            }
            else if( reply.status == "failed" ) {
                cb("failed", reply);
            }
            else {
                startPoll(reply, cb);
            }
        });
    });
    request.on('error', function (error) {
        cb(error);
    });
}

exports.Squeeze.prototype.notify = function (url) {
    console.log("Performing notification based op with push URL " + url);
    this.description.notification = url;
    console.dir(this.description);
    var request = createRequest('', this.description, function(response) {
        aggregate(response, function (data) {
            var reply = JSON.parse(data);
            console.dir(reply);
            // TODO how to notify push URL manually of error
            if( !reply ) {
                console.error('Invalid Reply', data);
            }
            else if( !reply.status ) {
                console.error('Unknown Error', data);
            }
            else if( reply.status == "failed" ) {
                console.error("failed", reply);
            }
        });
    });
    request.on('error', function (error) {
        // TODO how to notify push URL manually of error
        console.error(error);
    });
}
