import { middyfy } from '@libs/lambda';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { formatSuccessJSONResponse, formatErrorJSONResponse } from '@libs/apiGateway';
import { findById } from '../../service/productService';
import { NotFoundError } from '../../errors/NotFoundError';
import { logRequest } from '../../logger/logger';

const getProductsList: APIGatewayProxyHandler = async (event) => {
  logRequest(event);
  
  let productId = '';
  try {
    productId = event.pathParameters.productId;
  } catch {
    return formatErrorJSONResponse(400, 'productId parameter is mandatory');
  }

  try {
    const product = await findById(productId);
    return formatSuccessJSONResponse(200, product);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return formatErrorJSONResponse(404, error.message);
    }

    return formatErrorJSONResponse(500, 'AWS lambda error');
  }
}

export const main = middyfy(getProductsList);
