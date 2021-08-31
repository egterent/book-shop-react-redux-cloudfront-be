import type { APIGatewayProxyHandler } from 'aws-lambda';

import { middyfy } from '@libs/lambda';
import { list } from '../../service/productService';

const getProductsList: APIGatewayProxyHandler = async () => {
  try {
    const products = await list();
    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
}

export const main = middyfy(getProductsList);
