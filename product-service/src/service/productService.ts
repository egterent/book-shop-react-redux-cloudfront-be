import { Product } from '../models/Product';

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

export const list = (): Promise<string> =>
  readFile(`${__dirname}/data/productsList.json`).then(data => data.toString());

export const findByIsbn = async (isbn: string): Promise<Product> => {
  const products = await list();
  const result = JSON.parse(products).find(product => product.isbn === isbn);

  if (!result) {
    throw new Error(`The book with ISBN ${isbn} not found`);
  }

  return result;
};
