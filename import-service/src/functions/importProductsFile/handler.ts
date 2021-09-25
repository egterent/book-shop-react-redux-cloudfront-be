import { middyfy } from '@libs/lambda';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { formatResponseWithCredentials, formatErrorResponse } from '@libs/apiGateway';
import { logRequest, logError } from '../../../../shared/logger/logger';
import { S3 } from 'aws-sdk';

const importProductsFile: APIGatewayProxyHandler = async (event) => {
  logRequest(event);
  
  const fileName = event.queryStringParameters?.name;
  if (!fileName) {
    return formatErrorResponse(400, 'fileName parameter is mandatory');
  }

  const filePath = `uploaded/${fileName}`;
  const s3 = new S3({
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });
  const parameters = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filePath,
    Expires: 60,
    ContentType: 'text/csv',
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', parameters);
    return formatResponseWithCredentials(200, url);
  } catch (error) {
    logError(error);
    return formatErrorResponse(500, 'AWS lambda error');
  }
}

export const main = middyfy(importProductsFile);
