import type { APIGatewayProxyHandler } from 'aws-lambda';

import { middyfy } from '@libs/lambda';
import { findByIsbn } from '../../service/productService';

const getProductsList: APIGatewayProxyHandler = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const product = findByIsbn(productId);
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: error.message,
    };
  }
}

export const main = middyfy(getProductsList);
