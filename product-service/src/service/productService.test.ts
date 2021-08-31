import { list, findByIsbn } from "./productService";

import { NotFoundError } from "../errors/NotFoundError";

const productsList = require('./data/productsList.json');

beforeEach(() => {
    jest.clearAllMocks();
});

test("Should list products.", async () => {
    // act
    const actualResult = await list();

    // assert
    expect(actualResult).toEqual(productsList);
});

test.each([
    [
        productsList[0].id,
        productsList[0]
    ],
    [
        productsList[2].id,
        productsList[2]
    ]
])("Should return a product by its ISBN = %s.", async (id, expectedBook) => {
    // act
    const actualResult = await findByIsbn(id);

    // assert
    expect(actualResult).toEqual(expectedBook);
});

test("Should throw a NotFoundError if a product not found.", async () => {
    // arrange
    const id = "11111111111";
    const expectedError = new NotFoundError(`The product with ISBN ${id} not found`);

    // act and assert
    await expect(findByIsbn(id)).rejects.toThrow(expectedError);
});