import { mocked } from 'ts-jest/utils';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import { list } from '../../service/bookService';

jest.mock('@libs/lambda');
jest.mock('../../service/bookService');

const booksList = require('../../service/data/booksList.json');

let main;
let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
let mockedList: jest.MockedFunction<typeof list>;

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should return the books list.', async () => {
    // arrange
    mockedList = mocked(list);
    mockedList.mockResolvedValue(booksList);

    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(booksList),
    };

    // act 
    const actualResult = await main();

    // assert
    expect(mockedList).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 500 response in case of an unexpected error.', async () => {
    // arrange
    mockedList = mocked(list);
    mockedList.mockImplementation(() => { throw new Error("Something bad happend")});

    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        statusCode: 500,
        body: 'Internal Server Error',
    };

    // act 
    const actualResult = await main();

    // assert
    expect(mockedList).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});
