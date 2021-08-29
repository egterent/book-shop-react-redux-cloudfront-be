import { mocked } from 'ts-jest/utils';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { NotFoundError } from '../../errors/NotFoundError';
import { middyfy } from '@libs/lambda';
import { findByIsbn } from '../../service/bookService';

jest.mock('@libs/lambda');
jest.mock('../../service/bookService');

const booksList = require('../../service/data/booksList.json');

let main;
let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
let mockedfindByIsbn: jest.MockedFunction<typeof findByIsbn>;

const book = booksList[0];
const isbn = booksList[0].isbn;
const event = {
    pathParameters: {
        productId: isbn
    }
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should return a book by its ISBN.', async () => {
    // arrange
    mockedfindByIsbn = mocked(findByIsbn);
    mockedfindByIsbn.mockResolvedValue(book);

    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(book),
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedfindByIsbn).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});

test('Should return 404 response, if a book is not found.', async () => {
    // arrange
    const errorMessage = "Book not found";
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
        body: 'Internal Server Error',
    };

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedfindByIsbn).toHaveBeenCalledTimes(1);
    expect(actualResult).toEqual(expectedResult);
});
