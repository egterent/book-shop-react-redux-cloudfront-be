import { middyfy } from '@libs/lambda';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { formatSuccessJSONResponse, formatErrorJSONResponse } from '@libs/apiGateway';
import { findByIsbn } from '../../service/productService';
import { NotFoundError } from '../../errors/NotFoundError';

const getProductsList: APIGatewayProxyHandler = async (event) => {
  let productId = '';
  try {
    productId = event.pathParameters.productId;
  } catch {
    return formatErrorJSONResponse(400, 'Product id is mandatory');
  }

  try {
    const product = await findByIsbn(productId);
    return formatSuccessJSONResponse(200, product);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return formatErrorJSONResponse(404, error.message);
    }

    return formatErrorJSONResponse(500, 'Internal Server Error');
  }
}

export const main = middyfy(getProductsList);
