import { list, findByIsbn } from "./bookService";

import { NotFoundError } from "../errors/NotFoundError";

const booksList = require('./data/booksList.json');

beforeEach(() => {
    jest.clearAllMocks();
});

test("Should list books.", async () => {
    // act
    const actualResult = await list();

    // assert
    expect(actualResult).toEqual(booksList);
});

test.each([
    [
        booksList[0].isbn,
        booksList[0]
    ],
    [
        booksList[2].isbn,
        booksList[2]
    ]
])("Should return a book by its ISBN = %s.", async (isbn, expectedBook) => {
    // act
    const actualResult = await findByIsbn(isbn);

    // assert
    expect(actualResult).toEqual(expectedBook);
});

test("Should throw a NotFoundError if a book not found.", async () => {
    // arrange
    const isbn = "11111111111";
    const expectedError = new NotFoundError(`The book with ISBN ${isbn} not found`);

    // act and assert
    await expect(findByIsbn(isbn)).rejects.toThrow(expectedError);
});