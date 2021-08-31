import { formatSuccessJSONResponse, formatErrorJSONResponse } from '@libs/apiGateway';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import { list } from '../../service/productService';

const getProductsList: APIGatewayProxyHandler = async () => {
  try {
    const products = await list();
    return formatSuccessJSONResponse(200, products);
  } catch (error) {
    return formatErrorJSONResponse(500, 'AWS lambda error');
  }
}

export const main = middyfy(getProductsList);
