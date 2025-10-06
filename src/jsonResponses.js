// Read the book json file
const fs = require('fs');

const books = JSON.parse(fs.readFileSync(`${__dirname}/../client/books.json`));

// We'll only be using author, language, title, year, and genre
// So we'll populate those variables to start
const authors = [];
const languages = [];
const titles = [];
const years = [];
const genres = [];
const booksMade = {};

books.forEach((item) => {
  // so we can populate the book object
  const aut = item.author;
  const lan = item.language;
  const tit = item.title;
  const yr = item.year;
  const gen = item.genres;

  // add to arrays for populating pages
  authors.push(aut);
  languages.push(lan);
  titles.push(tit);
  years.push(yr);
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

  response.end();
};

const getBookData = (request, response) => {
  //gives generic data list we'll use to populate forms
  if (request.method === 'GET') {
    const results = {
      authors,
      languages,
      titles,
      years,
      genres,
    };

    return respondJSON(request, response, 200, results);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 404, {
    message: 'Page can not parse data!!',
    id: 'error',
  });
};

const getAuthors = (request, response) => {
  if (request.method === 'GET') {
    const results = {
      authors,
    };

    return respondJSON(request, response, 200, results);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 404, {
    message: 'Author not found',
    id: 'error',
  });
};

const getTitles = (request, response) => {
  if (request.method === 'GET') {
    const results = {
      titles,
    };

    return respondJSON(request, response, 200, results);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 404, {
    message: 'Title not found',
    id: 'error',
  });
};

// Taken code from "https://stackoverflow.com/questions/19259233/sorting-json-by-specific-element-alphabetically"
// Stack Overflow
// sorts aplhabetically into function

const getBook = (request, response) => {
  if (request.method === 'GET') {
    // checks each book and see if it contains the title
    const results = {
      booksMade
    };

    // checks each book and checks if it includes the
    // requested title and the genre/year range

    // results.sort((a, b) => {
    //   a = a.title.toLowerCase();
    //   b = b.title.toLowerCase();

    //   return a < b ? -1 : a > b ? 1 : 0;
    // });

    return respondJSON(request, response, 200, results);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 404, {
    message: 'Title not found',
    id: 'error',
  });
};

const notReal = (request, response) => {
  if (request.method === 'GET') {
    const results = {
      message: 'The page you are looking for was not found!!',
      id: 'notFound',
    };

    return respondJSON(request, response, 404, results);
  }

  return respondJSON(request, response, 404, {});
};

const addBook = (request, response) => {
  const responseJSON = {
    message: 'Title, Author, and Year are at LEAST required.',
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
      title,
      year,
      author,
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

module.exports = {
  getAuthors,
  addBook,
  notReal,
  getBookData,
  getBook,
  getTitles,
};
