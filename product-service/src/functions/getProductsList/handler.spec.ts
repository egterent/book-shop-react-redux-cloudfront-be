import { mocked } from 'ts-jest/utils';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import { list } from '../../service/productService';
import { logRequest } from '../../../../shared/logger/logger';

jest.mock('@libs/lambda');
jest.mock('../../service/productService');
jest.mock('../../../../shared/logger/logger');

const productsList = require('../../service/data/productsList.json');
const event = {
    httpMethod: 'get'
};

let main;
let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
let mockedList: jest.MockedFunction<typeof list>;
let mockedLogRequest: jest.MockedFunction<typeof logRequest>;

mockedMiddyfy = mocked(middyfy);
mockedLogRequest = mocked(logRequest);
mockedList = mocked(list);

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should return the products list.', async () => {
    // arrange
    mockedList.mockResolvedValue(productsList);

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
        body: JSON.stringify(productsList),
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedList).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 500 response in case of an unexpected error.', async () => {
    // arrange
    mockedList.mockImplementation(() => { throw new Error("Something bad happend")});

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
    expect(mockedList).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});
