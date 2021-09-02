export const formatSuccessJSONResponse = (statusCode: number, responseObject: Object) => {
  return {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: statusCode,
    body: JSON.stringify(responseObject)
  }
}

export const formatErrorJSONResponse = (statusCode: number, message: string) => {
  return {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: statusCode,
    body: message
  }
}
