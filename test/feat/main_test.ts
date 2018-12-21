import { must } from '@quenk/must';
import { readFile } from 'fs';
import { toPromise, fromCallback } from '@quenk/noni/lib/control/monad/future';
import {
    exec
} from 'child_process';

const SQL_DEFINITIONS = `${__dirname}/../fixtures/data/definitions/sql.json`;
const TEMPLATES = `${__dirname}/../fixtures/templates`;
const TS_TEMPLATE = `company.ts.dagen`;
const ORG = `${__dirname}/../fixtures/data/input/org.json`;
const ORG_CHECK = `${__dirname}/../fixtures/data/checks/org.json`;
const COMPANY = `${__dirname}/../fixtures/data/input/company.json`;
const COMPANY_SQL = `${__dirname}/../fixtures/data/output/company_sql.json`;
const COMPANY_TS = `${__dirname}/../fixtures/data/output/company_ts.json`;
const BIN = `${__dirname}/../../lib/main.js`;

const chmod = () => new Promise((rs, rj) =>
    exec(`chmod +x ${BIN} `, (err, out) => err ? rj(err) : rs(out)));

const readJSON = (path: string) =>
    toPromise(fromCallback(cb => readFile(path, cb))
        .map(JSON.parse));

const run =
    (args: string): Promise<string> => new Promise((onSuccess, onErr) =>
        exec(`${BIN} ${args} `, (err, text, etext) => {

            if (etext)
                console.error(text, etext);

            if (err)
                return onErr(err);

            onSuccess(text);

        }));

describe('dagen', () => {

    it('should produce the compiled object', () =>
        chmod()
            .then(() => run(
                `--templates ${TEMPLATES} ` +
                `--definitions ${SQL_DEFINITIONS} ` +
                `--namespace sql ${COMPANY} `))
            .then((text: string) =>
                readJSON(COMPANY_SQL)
                    .then((expected: string) => {

                        must(JSON.parse(text)).equate(expected);

                    })))

    it('should allow values to be set via --set flag', () =>
        chmod()
            .then(() => run(
                `--definitions ${SQL_DEFINITIONS} ` +
                `--set title="The Company Schema" ` +
                `--namespace sql ${COMPANY} `))
            .then((text: string) =>
                readJSON(COMPANY_SQL)
                    .then((expected: string) => {

                        (<any>expected).title = 'The Company Schema';

                        must(JSON.parse(text)).equate(expected);

                    })))

    it('should generate output', () =>
        chmod()
            .then(() => run(
                `--templates ${TEMPLATES} ` +
                `--template ${TS_TEMPLATE} ` +
                `--definitions ${SQL_DEFINITIONS} ` +
                `--namespace ts ${COMPANY} `))
            .then((text: string) =>
                readJSON(COMPANY_TS)
                    .then((expected: string) => {

                        must(JSON.parse(text)).equate(expected);

                    })))

    it('should apply checks', () =>
        chmod()
            .then(() => run(
                `--templates ${TEMPLATES} ` +
                `--template ${TS_TEMPLATE} ` +
                `--check ${ORG_CHECK} ${ORG} `))
            .then((text: string) =>
                readJSON(COMPANY_TS)
                    .then((expected: string) => {

                        must(JSON.parse(text)).equate(expected);

                    })))


});
