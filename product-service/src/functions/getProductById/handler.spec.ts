import { mocked } from 'ts-jest/utils';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { NotFoundError } from '../../errors/NotFoundError';
import { middyfy } from '@libs/lambda';
import { findByIsbn } from '../../service/productService';

jest.mock('@libs/lambda');
jest.mock('../../service/productService');

const productsList = require('../../service/data/productsList.json');

let main;
let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
let mockedfindByIsbn: jest.MockedFunction<typeof findByIsbn>;

const product = productsList[0];
const id = productsList[0].id;
const event = {
    pathParameters: {
        productId: id
    }
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should return a product by its ISBN.', async () => {
    // arrange
    mockedfindByIsbn = mocked(findByIsbn);
    mockedfindByIsbn.mockResolvedValue(product);

    mockedMiddyfy = mocked(middyfy);
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
    expect(mockedfindByIsbn).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 400 response if product id is missing.', async () => {
    // arrange
    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        statusCode: 400,
        body: 'productId parameter is mandatory',
    };

    // act 
    const actualResult = await main({});

    // assert
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 404 response, if a product is not found.', async () => {
    // arrange
    const errorMessage = "Product not found";
    mockedfindByIsbn = mocked(findByIsbn);
    mockedfindByIsbn.mockImplementation(() => { throw new NotFoundError(errorMessage)});

    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        statusCode: 404,
        body: errorMessage,
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedfindByIsbn).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 500 response in case of an unexpected error.', async () => {
    // arrange
    mockedfindByIsbn = mocked(findByIsbn);
    mockedfindByIsbn.mockImplementation(() => { throw new Error("Something bad happend")});

    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        statusCode: 500,
        body: 'AWS lambda error',
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedfindByIsbn).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});
