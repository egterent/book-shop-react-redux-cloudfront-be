const S3_BUCKET_NAME = 'S3_BUCKET_NAME';
process.env.S3_BUCKET_NAME = S3_BUCKET_NAME;

import { mocked } from 'ts-jest/utils';
import { middyfy } from '@libs/lambda';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { logRequest, logError } from '../../../../shared/logger/logger';
import { formatResponseWithCredentials, formatErrorResponse } from '@libs/apiGateway';
import { S3 } from 'aws-sdk';

let mockedGetSignedUrlPromise = jest.fn();

jest.mock('@libs/lambda');
jest.mock('../../../../shared/logger/logger');
jest.mock('@libs/apiGateway');
jest.mock('aws-sdk', () => {
    return {
        S3: jest.fn().mockImplementation(() => {
            return {
                getSignedUrlPromise: mockedGetSignedUrlPromise,
            };
        })
    };
});


let main;
let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
let mockedLogRequest: jest.MockedFunction<typeof logRequest>;
let mockedLogError: jest.MockedFunction<typeof logError>;
let mockedFormatResponseWithCredentials: jest.MockedFunction<typeof formatResponseWithCredentials>;
let mockedFormatErrorResponse: jest.MockedFunction<typeof formatErrorResponse>;

mockedLogRequest = mocked(logRequest);
mockedLogError = mocked(logError);
mockedMiddyfy = mocked(middyfy);
mockedFormatResponseWithCredentials = mocked(formatResponseWithCredentials);
mockedFormatErrorResponse = mocked(formatErrorResponse);

const fileName = 'file name';
const event = {
    httpMethod: 'get',
    queryStringParameters: {
        name: fileName
    }
};
const expectedFilePath = `uploaded/${fileName}`;
const expectedParameters = {
    Bucket: S3_BUCKET_NAME,
    Key: expectedFilePath,
    Expires: 60,
    ContentType: 'text/csv',
};
const expectedUrl = 'url';

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should return the url for the uploaded file.', async () => {
    // arrange
    mockedGetSignedUrlPromise.mockImplementation(() => expectedUrl);
    const mockedS3 = mocked(S3, true);
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const formattedResponse = {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        statusCode: 200,
        body: expectedUrl,
    };
    mockedFormatResponseWithCredentials.mockImplementation(() => formattedResponse);
    const expectedResult = formattedResponse;

    // act
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedS3).toHaveBeenCalledTimes(1);
    expect(mockedGetSignedUrlPromise).toHaveBeenCalledTimes(1);
    expect(mockedGetSignedUrlPromise).toHaveBeenCalledWith('putObject', expectedParameters);

    expect(actualResult).toEqual(expectedResult);
});

test('Should return 400 response if the file name is missing.', async () => {
    // arrange
    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const formattedResponse = {
        headers: {
            "Content-Type": "application/json",
        },
        statusCode: 400,
        body: 'fileName parameter is mandatory',
    };
    mockedFormatErrorResponse.mockImplementation(() => formattedResponse);
    const expectedResult = formattedResponse;

    // act 
    const actualResult = await main({});

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith({});

    expect(actualResult).toEqual(expectedResult);
});

test('Should return 500 response in case of an unexpected error.', async () => {
    // arrange
    const error = new Error('Someting bad just happend');
    mockedGetSignedUrlPromise.mockImplementation(() => {
        throw error;
    });
    const mockedS3 = mocked(S3, true);

    mockedMiddyfy.mockImplementation((handler: APIGatewayProxyHandler) => {
        return handler as never;
    });

    main = (await import('./handler')).main;

    const formattedResponse = {
        headers: {
            "Content-Type": "application/json",
        },
        statusCode: 500,
        body: 'AWS lambda error',
    };
    mockedFormatErrorResponse.mockImplementation(() => formattedResponse);
    const expectedResult = formattedResponse;

    // act 
    const actualResult = await main(event);

    // assert
    expect(mockedLogRequest).toHaveBeenCalledTimes(1);
    expect(mockedLogRequest).toHaveBeenCalledWith(event);
    expect(mockedS3).toHaveBeenCalledTimes(1);
    expect(mockedGetSignedUrlPromise).toHaveBeenCalledTimes(1);
    expect(mockedGetSignedUrlPromise).toHaveBeenCalledWith('putObject', expectedParameters);
    expect(mockedLogError).toHaveBeenCalledTimes(1);
    expect(mockedLogError).toHaveBeenCalledWith(error);

    expect(actualResult).toEqual(expectedResult);
});
