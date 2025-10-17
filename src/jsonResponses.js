// Read the book json file
const fs = require('fs');
// we'll need a url variable for our parameters
const url = require('url');

const books = JSON.parse(fs.readFileSync(`${__dirname}/../client/books.json`));

// We'll only be using author, language, title, year, and genre
// So we'll populate those variables to start
const genres = [];
const booksMade = {};

books.forEach((item) => {
  // so we can populate the book object
  const aut = item.author;
  const lan = item.language;
  const tit = item.title;
  const yr = item.year;
  const gen = item.genres;

  // assess if we already have that genre as an option
  // not all books have genres, may apply this check for all optional parameters

  if (item.genres) {
    gen.forEach((genre) => { if (!genres.includes(genre)) { genres.push(genre); } });
  }

  booksMade[item.title] = {
    aut,
    lan,
    tit,
    yr,
    gen,
  };
});

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  // console.log(response);

  response.end();
};

const getBookData = (request, response) => {
  // GET method
  if (request.method === ('GET') || request.method === ('HEAD')) {
    const results = Object.values(booksMade).map((book) => ({
      author: book.aut,
      language: book.lan,
      titles: book.tit,
      years: book.yr,
      genres: book.gen,
    }));

    return respondJSON(request, response, 200, { results });
  }

  return respondJSON(request, response, 404, {
    message: 'Page can not parse data!!',
    id: 'error',
  });
};

const getAuthors = (request, response) => {
  // Grabs a list of authors
  if (request.method === ('GET') || request.method === ('HEAD')) {
    const parsedUrl = url.parse(request.url, true);

    const { author } = parsedUrl.query;

    // Do a check for if each parameter is
    // even there and then filter by if they include given string value
    // because we sort by title we have to
    // start filtering based on entries and them return an object
    // from that
    const results = Object.values(booksMade).filter(
      (book) => ((!author || book.aut.includes(author)) && !book.aut.includes('Unknown')),
    ).map((bk) => bk.aut);

    return respondJSON(request, response, 200, { results });
  }

  return respondJSON(request, response, 404, {
    message: 'Author not found',
    id: 'error',
  });
};

const getTitles = (request, response) => {
  // Grabs the titles
  if (request.method === ('GET') || request.method === ('HEAD')) {
    const parsedUrl = url.parse(request.url, true);

    const { title } = parsedUrl.query;

    // Do a check for if each parameter is even there
    // and then filter by if they include given string value
    // because we sort by title we have to start filtering
    // based on entries and them return an object from that
    const results = Object.keys(booksMade).filter(
      (tit) => (!title || tit.includes(title)),
    );

    return respondJSON(request, response, 200, { results });
  }

  return respondJSON(request, response, 404, {
    message: 'Title not found',
    id: 'error',
  });
};


// GET Request
const getBook = (request, response) => {
  if (request.method === ('HEAD') || request.method === ('GET')) {
    // checks each book and see if it contains the title, year or author
    // parse our params
    const parsedUrl = url.parse(request.url, true);

    const { author, title, year } = parsedUrl.query;

    // Do a check for if each parameter is even
    // there and then filter by if they include given string value
    // because we sort by title we have to start
    // filtering based on entries and them return an object from that
    const results = Object.fromEntries(Object.entries(booksMade).filter(
      ([tit, book]) => (!author || book.aut.includes(author))
        && (!title || tit.includes(title))
        && (!year || book.yr === year),
    ));


    return respondJSON(request, response, 200, { results });
  }

  return respondJSON(request, response, 404, {
    message: 'Title not found',
    id: 'error',
  });
};

const notReal = (request, response) => {
  if (request.method === ('GET') || request.method === ('HEAD')) {
    const results = {
      message: 'The page you are looking for was not found!!',
      id: 'notFound',
    };

    return respondJSON(request, response, 404, { results });
  }

  return respondJSON(request, response, 404, {});
};

// POST REQUEST
const addBook = (request, response) => {
  const responseJSON = {
    message: 'Title, Author, and Year are required.',
  };

  // grab name and age out of request.body
  const { author, title, year } = request.body;

  // check to make sure we have both fields
  if (!title || !year || !author) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code if updating existing
  let responseCode = 204;

  // If the user doesn't exist yet
  if (!booksMade[title]) {
    // Set the status code to 201 (created) and create an empty user
    responseCode = 201;
    booksMade[title] = {
      tit: title,
      yr: year,
      aut: author,
    };
  }

  // add or update fields for this user name
  booksMade[title].year = year;
  booksMade[title].author = author;

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  // When we send back a 204 status code
  return respondJSON(request, response, responseCode, {});
};

// POST REQUEST
const addGenres = (request, response) => {
  const responseJSON = {
    message: 'Enter a title(case sensitive) and a comma separated list of genres.',
  };

  // grab genres out of request.body, should be a title and a comma separated array of genres
  const { title, genre } = request.body;

  const genreArray = genre?.split(',') || '';
  //console.log(title, genre, genreArray);



  // check to make sure we have both fields
  if (genreArray.length === 0 || !title) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // checks if title is actually in the list
  if (!booksMade[title]) {
    responseJSON.id = "Book doesn't exist";
    responseJSON.message = "Check list of titles or make your own";
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code if updating existing
  const responseCode = 204;
  // add or update fields for this genre
  booksMade[title].gen = genreArray;

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  // When we send back a 204 status code
  return respondJSON(request, response, responseCode, {});
};

module.exports = {
  getAuthors,
  addBook,
  notReal,
  getBookData,
  getBook,
  getTitles,
  addGenres,
};
