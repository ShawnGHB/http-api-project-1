const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  // error checking
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // chunking
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    // Now we can handle the parsed request like GET
    handler(request, response);
  });
};

// POST handler
const handlePost = (request, response, parsedUrl) => {
  // addUser
  if (parsedUrl.pathname === '/addBook') {
    // Call our below parseBody handler
    parseBody(request, response, jsonHandler.addBook);
  }
};

// GET handler
const handleGet = (request, response, parsedUrl) => {
  // route to correct method based on URL
  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getAuthors') {
    jsonHandler.getAuthors(request, response);
  }  else if (parsedUrl.pathname === '/getBookData') {
    jsonHandler.getBookData(request, response);
  } else if (parsedUrl.pathname === '/getBook') {
    jsonHandler.getBook(request, response);
  } else if (parsedUrl.pathname === '/notReal') {
    jsonHandler.notReal(request, response);
  } else if (parsedUrl.pathname === '/getTitles') {
    jsonHandler.getTitles(request, response);
  } else if (parsedUrl.pathname === '/books.json') {
    htmlHandler.getJSON(request, response);
  } else if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else {
    jsonHandler.notReal(request, response);
  }
};

const onRequest = (request, response) => {
  // checks betweed https or http to test for is it's encrypted
  const protocol = request.connection.encrypted ? 'https' : 'http';
  // parsedurl builds a new url by attaching the protocol and the requested headers host key
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  // request.acceptedTypes = request.headers.accept.split(',');

  // check if method is post or get
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else if (request.method === 'GET') {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
