import { mocked } from 'ts-jest/utils';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import Product from '../../models/Product';
import { createNewProduct } from '../../service/productService';
import { ValidationError } from '../../errors/ValidationError';
import { logRequest } from '../../logger/logger';

jest.mock('@libs/lambda');
jest.mock('../../service/productService');
jest.mock('../../logger/logger');

const product = {
    isbn: "1234567890123",
    title: "Title",
    author: "Author",
    publisher: "Publisher",
    description: "Description",
    year: 2020,
    price: 10.99,
    count: 1
};
const newProduct: Product = { id: "1", ...product };
const event = {
    httpMethod: 'post',
    body: '{"isbn": "1234567890123",\n"title": "Title",\n"author": "Author",\n"publisher": "Publisher",\n"description": "Description",\n"year": 2020,\n"price": 10.99,\n"count": 1}',
};

let main;
let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
let mockedCreateNewProduct: jest.MockedFunction<typeof createNewProduct>;
let mockedLogRequest: jest.MockedFunction<typeof logRequest>;

mockedMiddyfy = mocked(middyfy);
mockedLogRequest = mocked(logRequest);
mockedCreateNewProduct = mocked(createNewProduct);

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should return the products createNewProduct.', async () => {
    // arrange
    mockedCreateNewProduct.mockResolvedValue(newProduct);

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
        body: JSON.stringify(newProduct),
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedCreateNewProduct).toHaveBeenCalledTimes(1);
    expect(mockedCreateNewProduct).toHaveBeenCalledWith(product);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 400 response, if a product is not valid.', async () => {
    // arrange
    const errorMessage = "Product is invalid";
    mockedCreateNewProduct.mockImplementation(() => { throw new ValidationError(errorMessage)});

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
        body: errorMessage,
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedCreateNewProduct).toHaveBeenCalledTimes(1);
    expect(mockedCreateNewProduct).toHaveBeenCalledWith(product);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 500 response in case of an unexpected error.', async () => {
    // arrange
    mockedCreateNewProduct.mockImplementation(() => { throw new Error("Something bad happend")});

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
    expect(mockedCreateNewProduct).toHaveBeenCalledTimes(1);
    expect(mockedCreateNewProduct).toHaveBeenCalledWith(product);
    expect(actualResult).toEqual(expectedResult);
});
