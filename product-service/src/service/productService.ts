import Product from '../models/Product';
import { executeQuery, executeTransactionQuery } from './dataBase/pgClient';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';
import validate from '../models/Product.validator';

const productFields = 'isbn, title, author, publisher, description, year, price';
const allFields = 'id, ' + productFields + ', count';

export const list = async (): Promise<Array<Product>> => {
  const query = `select ${allFields} from products inner join stocks on stocks.product_id=products.id where stocks.count > 0`;
  const productsList = await executeQuery<Product>(query);

  return productsList;
}

export const findById = async (id: string): Promise<Product> => {
  const query = `select ${allFields} from products inner join stocks on stocks.product_id=products.id where products.id='${id}'`;
  const [product] = await executeQuery<Product>(query);

  if (!product) {
    throw new NotFoundError(`The product with id ${id} not found`);
  }

  return product;
};

export const createNewProduct = async (product: Product): Promise<Product> => {
  let validProduct: Product;
  try {
    validProduct = validate(product);
  } catch (error) {
    throw new ValidationError(error.message);
  }

  const { isbn, title, author, publisher, description, year, price, count } = validProduct;
  const values = `'${isbn}', '${title}', '${author}', '${publisher}', '${description}', '${year}', '${price.toString()}'`;
  
  const productQuery = `insert into products (${productFields}) values (${values}) returning *`;

  const createStock = prevValues => `insert into stocks (product_id, count) values ('${prevValues[0][0].id}', '${count.toString()}') returning count`;

  const result = await executeTransactionQuery([productQuery, createStock]);

  return result.flat().reduce((acc, item) => ({ ...acc, ...item}), { });
};
