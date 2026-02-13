import { sql } from '@vercel/postgres';

export const db = sql;

export async function query(snippet: TemplateStringsArray, ...values: any[]) {
    return sql(snippet, ...values);
}
