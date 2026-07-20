declare module 'sql.js' {
  export type BindParams = Record<string, unknown>;
  export interface Statement {
    bind(params?: BindParams): boolean;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): boolean;
  }
  export interface QueryResult { columns: string[]; values: unknown[][]; }
  export interface Database {
    run(sql: string, params?: BindParams): Database;
    exec(sql: string): QueryResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    getRowsModified(): number;
  }
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array | Buffer) => Database;
  }
  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
}
