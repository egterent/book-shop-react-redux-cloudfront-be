export const logRequest = event => {
  let log = '';

  log += `Method: ${event.httpMethod}\n`;
  log += `Path: ${event.resource}\n`;

  if (event.queryStringParameters) {
    log += `Query: ${JSON.stringify(event.queryStringParameters)}\n`;
  }

  if (event.pathParameters) {
    log += `Parameters: ${JSON.stringify(event.pathParameters)}\n`;
  }

  if (event.body) {
    log += `Body: ${event.body}`;
  }

  console.log(log);
};

export const logError = error => {
  console.log(`ERROR: ${error.message}`);
};

export const logInfo = (message) => {
  console.info(message);
}