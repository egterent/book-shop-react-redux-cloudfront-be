import { formatSuccessJSONResponse, formatErrorJSONResponse } from '@libs/apiGateway';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import { list } from '../../service/productService';
import { logRequest } from '../../logger/logger';

const getProductsList: APIGatewayProxyHandler = async (event) => {
  logRequest(event);
  try {
    const products = await list();
    return formatSuccessJSONResponse(200, products);
  } catch (error) {
    return formatErrorJSONResponse(500, 'AWS lambda error');
  }
}

export const main = middyfy(getProductsList);
