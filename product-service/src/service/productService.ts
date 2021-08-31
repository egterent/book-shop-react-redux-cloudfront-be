import { Product } from '../models/Product';
import { NotFoundError } from '../errors/NotFoundError';

const productsList = require('./data/productsList.json');

export const list = async (): Promise<Product[]> => productsList;

export const findByIsbn = async (id: string): Promise<Product> => {
  const result = productsList.find(product => product.id === id);

  if (!result) {
    throw new NotFoundError(`The product with ISBN ${id} not found`);
  }

  return result;
};
