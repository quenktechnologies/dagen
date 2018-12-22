import { must } from '@quenk/must';
import { Future, toPromise, fromCallback } from '@quenk/noni/lib/control/monad/future';
import { readTextFile } from '@quenk/noni/lib/io/file';
import { exec } from 'child_process';

const SQL_DEFINITIONS = `${__dirname}/../fixtures/data/definitions/sql.json`;
const TEMPLATES = `${__dirname}/../fixtures/templates`;
const TS_TEMPLATE = `company.ts.dagen`;
const ORG = `${__dirname}/../fixtures/data/input/org.json`;
const ORG_CHECK = `${__dirname}/../fixtures/data/checks/org.json`;
const ORG_TS = `${__dirname}/../fixtures/data/output/org_ts.json`;
const ORG_JSON = `${__dirname}/../fixtures/data/output/org.json`;
const COMPANY = `${__dirname}/../fixtures/data/input/company.json`;
const COMPANY_SQL = `${__dirname}/../fixtures/data/output/company_sql.json`;
const BIN = `${__dirname}/../../lib/main.js`;

const chmod = () =>
    fromCallback(cb => exec(`chmod +x ${BIN} `, cb));

const readJSON = (path: string) =>
    readTextFile(path).map(JSON.parse);

const run =
    (args: string): Future<string> => fromCallback(cb =>
        exec(`${BIN} ${args} `, (err, text, etext) => {

            if (etext)
                console.error(text, etext);

            if (err)
                return cb(err);

            cb(undefined, text);

        }));

describe('dagen', () => {

    it('should produce the compiled object', () =>
        toPromise(chmod()
            .chain(() => run(
                `--templates ${TEMPLATES} ` +
                `--definitions ${SQL_DEFINITIONS} ` +
                `--namespace sql ${COMPANY} `))
            .chain((text: string) =>
                readJSON(COMPANY_SQL)
                    .map((expected: string) => {

                        must(JSON.parse(text)).equate(expected);

                    }))))

    it('should allow values to be set via --set flag', () =>
        toPromise(chmod()
            .chain(() => run(
                `--definitions ${SQL_DEFINITIONS} ` +
                `--set title="The Company Schema" ` +
                `--namespace sql ${COMPANY} `))
            .chain((text: string) =>
                readJSON(COMPANY_SQL)
                    .map((expected: string) => {

                        (<any>expected).title = 'The Company Schema';

                        must(JSON.parse(text)).equate(expected);

                    }))))

    it('should generate output', () =>
        toPromise(chmod()
            .chain(() => run(
                `--templates ${TEMPLATES} ` +
                `--template ${TS_TEMPLATE} ` +
                `--definitions ${SQL_DEFINITIONS} ` +
                `--namespace ts ${COMPANY} `))
            .chain((text: string) =>
                readJSON(ORG_TS)
                    .map((expected: string) => {

                        must(JSON.parse(text)).equate(expected);

                    }))))

    it('should apply checks', () =>
        toPromise(chmod()
            .chain(() => run(
                `--check ${ORG_CHECK} ${ORG} `))
            .chain((text: string) =>
                readJSON(ORG_JSON)
                    .map((expected: string) => {

                        must(JSON.parse(text)).equate(expected);

                    }))))

});
