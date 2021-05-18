import * as duckdb from '../src/';
import * as arrow from 'apache-arrow';

const testRows = 10000;

export function testBatchStream(db: () => duckdb.DuckDBBindings): void {
    let conn: duckdb.DuckDBConnection;

    beforeEach(() => {
        conn = db().connect();
    });

    afterEach(() => {
        conn.disconnect();
    });

    describe('Arrow Record-Batches Row-Major', () => {
        describe('single column', () => {
            it('TINYINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 127)::TINYINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const row of batch) {
                        expect(row!.v).toBe(i++ & 127);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('SMALLINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 32767)::SMALLINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const row of batch) {
                        expect(row!.v).toBe(i++ & 32767);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('INTEGER', () => {
                const result = conn.sendQuery(`
                    SELECT v::INTEGER AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const row of batch) {
                        expect(row!.v).toBe(i++);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('BIGINT', () => {
                const result = conn.sendQuery(`
                    SELECT v::BIGINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const row of batch) {
                        expect(row!.v.valueOf()).toBe(i++);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('STRING', () => {
                const result = conn.sendQuery(`
                    SELECT v::VARCHAR AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const row of batch) {
                        expect(row!.v).toBe(String(i++));
                    }
                }
                expect(i).toBe(testRows + 1);
            });
        });
    });

    describe('Arrow Record-Batches Column-Major', () => {
        describe('single column', () => {
            it('TINYINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 127)::TINYINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const v of batch.getChildAt(0)!) {
                        expect(v).toBe(i++ & 127);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('SMALLINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 32767)::SMALLINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const v of batch.getChildAt(0)!) {
                        expect(v).toBe(i++ & 32767);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('INTEGER', () => {
                const result = conn.sendQuery(`
                    SELECT v::INTEGER AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const v of batch.getChildAt(0)!) {
                        expect(v).toBe(i++);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('BIGINT', () => {
                const result = conn.sendQuery(`
                    SELECT v::BIGINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const v of batch.getChildAt(0)!) {
                        expect(v.valueOf()).toBe(i++);
                    }
                }
                expect(i).toBe(testRows + 1);
            });

            it('STRING', () => {
                const result = conn.sendQuery(`
                    SELECT v::VARCHAR AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                let i = 0;
                for (const batch of result) {
                    expect(batch.numCols).toBe(1);
                    for (const v of batch.getChildAt(0)!) {
                        expect(v).toBe(String(i++));
                    }
                }
                expect(i).toBe(testRows + 1);
            });
        });
    });

    describe('Arrow Table Row-Major', () => {
        describe('single column', () => {
            it('TINYINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 127)::TINYINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const row of table) {
                    expect(row.v).toBe(i++ & 127);
                }
                expect(i).toBe(testRows + 1);
            });

            it('SMALLINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 32767)::SMALLINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const row of table) {
                    expect(row.v).toBe(i++ & 32767);
                }
                expect(i).toBe(testRows + 1);
            });

            it('INTEGER', () => {
                const result = conn.sendQuery(`
                    SELECT v::INTEGER AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const row of table) {
                    expect(row.v).toBe(i++);
                }
                expect(i).toBe(testRows + 1);
            });

            it('BIGINT', () => {
                const result = conn.sendQuery(`
                    SELECT v::BIGINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const row of table) {
                    expect(row.v.valueOf()).toBe(i++);
                }
                expect(i).toBe(testRows + 1);
            });

            it('STRING', () => {
                const result = conn.sendQuery(`
                    SELECT v::VARCHAR AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const row of table) {
                    expect(row.v.valueOf()).toBe(String(i++));
                }
                expect(i).toBe(testRows + 1);
            });
        });
    });

    describe('Arrow Table Column-Major', () => {
        describe('single column', () => {
            it('TINYINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 127)::TINYINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const v of table.getColumnAt(0)!) {
                    expect(v).toBe(i++ & 127);
                }
                expect(i).toBe(testRows + 1);
            });

            it('SMALLINT', () => {
                const result = conn.sendQuery(`
                    SELECT (v & 32767)::SMALLINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const v of table.getColumnAt(0)!) {
                    expect(v).toBe(i++ & 32767);
                }
                expect(i).toBe(testRows + 1);
            });

            it('INTEGER', () => {
                const result = conn.sendQuery(`
                    SELECT v::INTEGER AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const v of table.getColumnAt(0)!) {
                    expect(v).toBe(i++);
                }
                expect(i).toBe(testRows + 1);
            });

            it('BIGINT', () => {
                const result = conn.sendQuery(`
                    SELECT v::BIGINT AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const v of table.getColumnAt(0)!) {
                    expect(v.valueOf()).toBe(i++);
                }
                expect(i).toBe(testRows + 1);
            });

            it('STRING', () => {
                const result = conn.sendQuery(`
                    SELECT v::VARCHAR AS v FROM generate_series(0, ${testRows}) as t(v);
                `);
                const table = arrow.Table.from(result);
                let i = 0;
                for (const v of table.getColumnAt(0)!) {
                    expect(v.valueOf()).toBe(String(i++));
                }
                expect(i).toBe(testRows + 1);
            });
        });
    });
}
