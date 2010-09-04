var squeeze = require('..')
  , sys = require('sys')

//squeeze.API_KEY = 'Your key'; // Uncomment and modify this before running the example

if( !process.argv[2] ) {
    console.error("Usage: " + process.argv.join(' ') + " url");
}

var s = new squeeze.Squeeze('http://farm5.static.flickr.com/4116/4774485856_e9aa9d81cf_b.jpg');
s.op('resize', '100x400!')
   .and('monochrome')
   .and('flip')
 .op('negate')
   .and('flip')
 .poll(function (err, data) {
    if(err)
        console.error(err);
    else
        console.log("Finished:", sys.inspect(data));
});
