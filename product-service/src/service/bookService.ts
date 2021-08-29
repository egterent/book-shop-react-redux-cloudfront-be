import { Book } from '../models/Book';
import { NotFoundError } from '../errors/NotFoundError';

const booksList = require('./data/booksList.json');

export const list = async (): Promise<JSON> => booksList;

export const findByIsbn = async (isbn: string): Promise<Book> => {
  const result = booksList.find(book => book.isbn === isbn);

  if (!result) {
    throw new NotFoundError(`The book with ISBN ${isbn} not found`);
  }

  return result;
};
