# A tiny Node.js Webserver - With Jade

## What is it?

The tiny node.js webserver (hereafter, "tinywebserver") is just that, a simple webserver implemented as a single, stand-alone coffescript file, created by [Rodney Waldhoff](https://github.com/rodw/tiny-node.js-webserver). My version is a re-implemention of the original file, in native node javascript.

Origanly By design, the tinywebserver has **no external dependencies** outside of the core node.js libaries and
of course, my version uses just one dependencies for the jade templates. (layouts are not implemented at this time)

There are [many other](https://github.com/joyent/node/wiki/modules#wiki-web-frameworks-static) simple node.js applications for serving static files over HTTP, however the tinywebserver is the only one I know of meets the "all-in-one-file" criterion, only needing the the jade dependencies, if you want to server jade files.

## Why is it?

Sometimes you just need a little webserver.

Specifically, web browsers often treat resources served from local `file://` URLs slightly differently those served via `http://` URLs.  The tinywebserver offers a quick-and-dirty way to serve local files over HTTP, which can come in handy when developing web applications based on local HTTP/JS/CSS files... etc. With my changes you 
can now server jade files, as well as use a jade files as your index.

Just copy the file tinywebserver.js and the package.json file. Then run

	npm install

to download all the node dependents and run the file in node.

	node tinywebserver.js 


That's all.  The tnws should now be listening at port 3000 on your localhost.  For example, you can fetch the `twns.js` source code itself by visiting <http://localhost:3000/tinywebserver.js>.