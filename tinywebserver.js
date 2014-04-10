// tinywebserver.js
//
// A modification of Rod Waldhoff's tiny node.js webserver 
// original written in coffeescript
// Changed into native javascript, and added jade compatibility
// April 10, 2014
//
// original headers of coffeescript version:
//
// A simple static-file web server implemented as a stand-alone
// Node.js/CoffeeScript app.
//---------------------------------------------------------------------
// For more information, see:
// <https://github.com/rodw/tiny-node.js-webserver>
//---------------------------------------------------------------------
// This program is distributed under the "MIT License".
// (See <http://www.opensource.org/licenses/mit-license.php>.)
//---------------------------------------------------------------------
// Copyright (c) 2012 Rodney Waldhoff
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------

var path = require('path');
var http = require('http');
var fs = require('fs');
var jade = require('jade');
var url = require('url');
var querystring = require('querystring');

var jadeOptions = {
  'pretty': 'true'
};

var MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jade': 'text/jade',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
};

var options = {
    host: 'localhost',
    port:  process.env.PORT || process.argv[3] || 3000,
    index1: 'index.html',
    index2: 'index.jade',
    docroot: './'
};




var get_mime = function(filename) {
    var ext, type;
    for (ext in MIME_TYPES) {
        type = MIME_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return type;
        }
    }
    return null;
};


var respond = function(request, response, status, content, content_type) {
    if (!status) {
        status = 200;
    }

    if (!content_type) {
        content_type = 'text/plain';
    }
    console.log(content_type);
    console.log("" + status + "\t" +
                request.method + "\t" + request.url);
    response.writeHead(status, {
        "Content-Type": content_type
    });
    if (content) {
        response.write(content);
    }
    return response.end();
};

var serve_file = function(request, response, requestpath, query) {


    return fs.readFile(requestpath, function(error, content) {
        if (error !== null) {
            console.error("ERROR: Encountered error while processing " +
                          request.method + " of \"" + request.url +
                          "\".", error);
            return respond(request, response, 500);
        } else {
            // find content type
            var content_type = get_mime(requestpath);
            // if type is jade
            if (content_type === 'text/jade'){
                // Compile a function
                var cJade = jade.compile(content, jadeOptions);
                // Render the function
                html = cJade(query);
                //Save the html
                content = html;
                //Change the content type to html
                content_type = 'text/html';
            }

            return respond(request, response, 200,
                           content, content_type);
        }
    });
};

var serve_404 = function(request, response){
    var requestpath = './404.html';
    return fs.readFile(requestpath, function(error, content) {
        if (error !== null) {
            console.error("ERROR: Encountered error while processing " +
                          request.method + " of \"" + request.url +
                          "\".", error);
            console.log("html 404 page error");
            return respond(request, response, 400);
        } else {

            // if type is jade
            var content_type = get_mime(requestpath);
            // if type is jade
            if (content_type === 'text/jade'){
                // Compile a function
                var cJade = jade.compile(content, jadeOptions);
                // Render the function
                html = cJade();
                //Save the html
                content = html;
                //Change the content type to html
                content_type = 'text/html';
            }


            return respond(request, response, 400,
                           content, content_type);
        }
    });
};

var return_index = function(request, response, requestpath, query)  {
       var exists_callback1 = function(file_exists) {
        if (file_exists) {
            requestpath += options.index1;
            return serve_file(request, response, requestpath, query);
        } else {
            requestpath += options.index2;
            return fs.exists(requestpath, exists_callback2);
        }
    };
    var exists_callback2 = function(file_exists) {
        if (file_exists) {
            return serve_file(request, response, requestpath, query);
        } else {
            console.log(requestpath);
            return serve_404(request, response);
        }
    };

    if (requestpath.substr(-1) !== '/') {
        requestpath += "/";
    }
    var testRequestpath = requestpath + options.index1;
    return fs.exists(testRequestpath, exists_callback1);
};

var request_handler = function(request, response) {
    var requestpath;
    //Using the url.parse to split the query and the path
    parsedURL = url.parse(request.url);
    request.url = parsedURL.pathname;
    var queryString = parsedURL.query;
    //Parses the query
    var query = querystring.parse(queryString);


    if (request.url.match(/((\.|%2E|%2e)(\.|%2E|%2e))|(~|%7E|%7e)/) !== null) {
        console.warn("WARNING: " + request.method +
                     " of \"" + request.url +
                     "\" rejected as insecure.");
        return respond(request, response, 403);

    } else {
        requestpath = path.normalize(path.join(options.docroot, request.url));
        return fs.exists(requestpath, function(file_exists) {
            if (file_exists) {
                return fs.stat(requestpath, function(err, stat) {
                    if (err !== null) {
                        console.error("ERROR: Encountered error calling" +
                                      "fs.stat on \"" + requestpath +
                                      "\" while processing " +
                                      request.method + " of \"" +
                                      request.url + "\".", err);
                        return respond(request, response, 500);
                    } else {
                        if ((stat !== null) && stat.isDirectory()) {
                            return return_index(request, response, requestpath, query);
                        } else {

                            return serve_file(request, response, requestpath, query);
                        }
                    }
                });
            } else {
                return serve_404(request, response);
            }
        });
    }
};

var server = http.createServer(request_handler);

server.listen(options.port, options.host, function() {
    return console.log("Server listening at:  http://" +
                       options.host + ":" + options.port + "/"+
                       '\n'+"   Loading Files at:  "+options.docroot);
});
