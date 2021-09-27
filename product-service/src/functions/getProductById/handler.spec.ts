import { mocked } from 'ts-jest/utils';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { NotFoundError } from '../../errors/NotFoundError';
import { middyfy } from '@libs/lambda';
import { findById } from '../../service/productService';
import { logRequest } from '../../../../shared/logger/logger';

jest.mock('@libs/lambda');
jest.mock('../../service/productService');
jest.mock('../../../../shared/logger/logger');

const productsList = require('../../service/data/productsList.json');

let main;
let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
let mockedfindById: jest.MockedFunction<typeof findById>;
let mockedLogRequest: jest.MockedFunction<typeof logRequest>;

mockedLogRequest = mocked(logRequest);
mockedMiddyfy = mocked(middyfy);
mockedfindById = mocked(findById);

const product = productsList[0];
const id = productsList[0].id;
const event = {
    httpMethod: 'get',
    pathParameters: {
        productId: id
    }
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should return a product by its ISBN.', async () => {
    // arrange
    mockedfindById.mockResolvedValue(product);

    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        headers: {
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        statusCode: 200,
        body: JSON.stringify(product),
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedfindById).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 400 response if product id is missing.', async () => {
    // arrange
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        statusCode: 400,
        body: 'productId parameter is mandatory',
    };

    // act 
    const actualResult = await main({});

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith({});
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 404 response, if a product is not found.', async () => {
    // arrange
    const errorMessage = "Product not found";
    mockedfindById.mockImplementation(() => { throw new NotFoundError(errorMessage)});

    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        statusCode: 404,
        body: errorMessage,
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedfindById).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 500 response in case of an unexpected error.', async () => {
    // arrange
    mockedfindById.mockImplementation(() => { throw new Error("Something bad happend")});

    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        statusCode: 500,
        body: 'AWS lambda error',
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedfindById).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});
