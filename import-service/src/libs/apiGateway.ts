export const formatResponse = (statusCode: number, result: string) => {
  return {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: statusCode,
    body: result
  }
}
