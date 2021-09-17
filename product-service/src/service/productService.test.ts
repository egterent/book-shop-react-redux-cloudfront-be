import { executeQuery, executeTransactionQuery } from './dataBase/pgClient';
import { list, findById, createNewProduct } from './productService';
import validate from '../models/Product.validator';
import Product from '../models/Product';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';

jest.mock('./dataBase/pgClient');
jest.mock('../models/Product.validator');

const mockedExecuteQuery = (executeQuery as unknown) as jest.Mock;
const mockedExecuteTransactionQuery = (executeTransactionQuery as unknown) as jest.Mock;
const mockedValidate = (validate as unknown) as jest.Mock;

const productsList: Product[] = [
    {
        "id": "1",
        "isbn": "1234567890123",
        "title": "first book title",
        "author": "first book author",
        "publisher": "first book publisher",
        "description": "first book description",
        "year": 2020,
        "price": 11.99,
        "count": 3
    },
    {
        "id": "2",
        "isbn": "1234567890124",
        "title": "second book title",
        "author": "second book author",
        "publisher": "second book publisher",
        "description": "second book description",
        "year": 2019,
        "price": 23.39,
        "count": 15
    },
    {
        "id": "3",
        "isbn": "1234567890125",
        "title": "third book title",
        "author": "third book author",
        "publisher": "third book publisher",
        "description": "third book description",
        "year": 2021,
        "price": 45.49,
        "count": 1
    }
];

beforeEach(() => {
    jest.clearAllMocks();
});

test("Should list products.", async () => {
    // arrange
    mockedExecuteQuery.mockResolvedValue(productsList);
    const expectedQuery = 'select id, isbn, title, author, publisher, description, year, price, count from products inner join stocks on stocks.product_id=products.id where stocks.count > 0';
    const expectedResult = productsList;
    // act
    const actualResult = await list();

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(mockedExecuteQuery).toBeCalledTimes(1);
    expect(mockedExecuteQuery).toBeCalledWith(expectedQuery);
});

test("Should return a product by its id.", async () => {
    // arrange
    const id = "product_id";
    mockedExecuteQuery.mockResolvedValue([ productsList[0] ]);
    const expectedQuery = `select id, isbn, title, author, publisher, description, year, price, count from products inner join stocks on stocks.product_id=products.id where products.id='${id}'`;
    const expectedResult = productsList[0];

    // act
    const actualResult = await findById(id);

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(mockedExecuteQuery).toBeCalledTimes(1);
    expect(mockedExecuteQuery).toBeCalledWith(expectedQuery);
});

test("Should throw a NotFoundError if a product not found.", async () => {
    // arrange
    const emptyResult: Product[] = [];
    mockedExecuteQuery.mockResolvedValue(emptyResult);
    const id = "11111111111";
    const expectedQuery = `select id, isbn, title, author, publisher, description, year, price, count from products inner join stocks on stocks.product_id=products.id where products.id='${id}'`;    
    const expectedError = new NotFoundError(`The product with id ${id} not found`);

    // act and assert
    await expect(findById(id)).rejects.toThrow(expectedError);
    expect(mockedExecuteQuery).toBeCalledTimes(1);
    expect(mockedExecuteQuery).toBeCalledWith(expectedQuery);
});

test("Should create a new product successfully.", async () => {
    // arrange
    const productFields = {
        isbn: "1234567890123",
        title: "Title",
        author: "Author",
        publisher: "Publisher",
        description: "Description",
        year: 2020,
        price: 10.99
    };
    const count = 11;
    const productToCreate: Product = { ...productFields, count };
    mockedValidate.mockReturnValue(productToCreate);
    const id = 'product_id';
    mockedExecuteTransactionQuery.mockResolvedValue([[{ id, ...productFields }], [{ count }]]);
   
    const expectedProductQuery = `insert into products (isbn, title, author, publisher, description, year, price) values ('1234567890123', 'Title', 'Author', 'Publisher', 'Description', '2020', '10.99') returning *`;
    const expectedResult: Product = { id, ...productFields, count };

    // act
    const actualResult = await createNewProduct(productToCreate);

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(mockedValidate).toBeCalledTimes(1);
    expect(mockedValidate).toBeCalledWith(productToCreate);
    expect(mockedExecuteTransactionQuery).toBeCalledTimes(1);
    expect(mockedExecuteTransactionQuery).toBeCalledWith([expectedProductQuery, expect.any(Function)]);
});

test("Should throw a ValidationError if a product is invalid.", async () => {
    // arrange
    const invalidProduct: Product = {
        isbn: "1234567890123",
        title: "Title",
        author: "Author",
        publisher: "Publisher",
        description: "Description",
        year: -100,
        price: 10.99,
        count: -1
    }
    const message = 'The product is invalid';
    mockedValidate.mockImplementation(() => {
        throw new Error(message);
    });
    const expectedError = new ValidationError(message);

    // act and assert
    await expect(createNewProduct(invalidProduct)).rejects.toThrow(expectedError);
    expect(mockedValidate).toBeCalledTimes(1);
    expect(mockedValidate).toBeCalledWith(invalidProduct);
    expect(mockedExecuteQuery).toBeCalledTimes(0);
});