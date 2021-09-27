export const formatResponseWithCredentials = (statusCode: number, result: string) => {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    statusCode: statusCode,
    body: result
  }
}

export const formatErrorResponse = (statusCode: number, message: string) => {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode: statusCode,
    body: message
  }
}
