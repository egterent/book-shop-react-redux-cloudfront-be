import { middyfy } from '@libs/lambda';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { formatSuccessJSONResponse, formatErrorJSONResponse } from '@libs/apiGateway';
import Product from '../../models/Product';
import { createNewProduct } from '../../service/productService';
import { ValidationError } from '../../errors/ValidationError';
import { logRequest } from '../../logger/logger';

const createProduct: APIGatewayProxyHandler = async (event) => {
    logRequest(event);
    try {
        const product: Product = JSON.parse(event.body);
        const newProduct = await createNewProduct(product);
        return formatSuccessJSONResponse(200, newProduct);
    } catch (error) {
        if (error instanceof ValidationError) {
            return formatErrorJSONResponse(400, error.message);
        }

        return formatErrorJSONResponse(500, 'AWS lambda error');
    }
}

export const main = middyfy(createProduct);
