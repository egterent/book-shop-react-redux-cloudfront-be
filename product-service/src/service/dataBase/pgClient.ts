import { Client, ClientConfig, QueryConfig, QueryResult } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const options: ClientConfig = {
    host: PG_HOST,
    port: +PG_PORT,
    database: PG_DATABASE,
    user: PG_USERNAME,
    password: PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
};

export async function executeQuery<T>(query: string): Promise<Array<T>> {
    const client = new Client(options);
    await client.connect();

    try {
        const result: QueryResult = await client.query(query);

        return result.rows;
    } catch (error) {
        throw error;
    } finally {
        await client.end();
    }
}

// @ts-ignore
export async function executeTransactionQuery(queryBuilders): any {
    const client = new Client(options);
    await client.connect();

    try {
        await client.query('BEGIN');
        const results = [];
        for (const queryBuilder of queryBuilders) {
            let query: QueryConfig = null;

            if (typeof queryBuilder === 'function') {
                query = await queryBuilder(results);
            } else {
                query = queryBuilder;
            }
            const { rows: result } = await client.query(query);
            results.push(result);
        }
        await client.query('COMMIT');

        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        await client.end();
    }
}