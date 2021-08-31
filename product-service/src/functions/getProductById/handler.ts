import type { APIGatewayProxyHandler } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import { findByIsbn } from '../../service/productService';
import { NotFoundError } from '../../errors/NotFoundError';

const getProductsList: APIGatewayProxyHandler = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const product = await findByIsbn(productId);
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        statusCode: 404,
        body: error.message,
      };
    }

    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
}

export const main = middyfy(getProductsList);
