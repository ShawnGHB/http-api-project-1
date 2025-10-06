// function to respond
const users = {};

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

const getUsers = (request, response) => {
  if (request.method === 'GET') {
    const results = {
      users,
    };

    return respondJSON(request, response, 200, results);
  }

  if (request.method === 'HEAD') {
    return respondJSON(request, response, 200, {});
  }

  return respondJSON(request, response, 404, {
    message: 'Enter a proper Name or Age!!',
    id: 'error',
  });
};

const notReal = (request, response) => {
  if (request.method === 'GET') {
    const results = {
      message: 'The page you are looking for was not found!!',
      id: 'notFound',
    };

    return respondJSON(request, response, 404, (results));
  }

  return respondJSON(request, response, 404, {});
};

const addUser = (request, response) => {
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  // grab name and age out of request.body
  const { name, age } = request.body;

  // check to make sure we have both fields
  if (!name || !age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code if updating existing
  let responseCode = 204;

  // If the user doesn't exist yet
  if (!users[name]) {
    // Set the status code to 201 (created) and create an empty user
    responseCode = 201;
    users[name] = {
      name,
    };
  }

  // add or update fields for this user name
  users[name].age = age;

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
  getUsers,
  addUser,
  notReal,
};
