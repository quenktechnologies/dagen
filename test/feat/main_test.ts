import * as must from 'must/register';
import * as Promise from 'bluebird';
import { readFile } from 'fs';
import {
    exec
} from 'child_process';

const SQL_DEFINITIONS = `${__dirname}/../fixtures/data/definitions/sql.json`;
const TEMPLATES = `${__dirname}/../fixtures/templates`;
const TS_TEMPLATE = `company.ts.dagen`;
const COMPANY = `${__dirname}/../fixtures/data/input/company.json`;
const COMPANY_SQL = `${__dirname}/../fixtures/data/output/company_sql.json`;
const COMPANY_TS = `${__dirname}/../fixtures/data/output/company_ts.json`;
const BIN = `${__dirname}/../../lib/main.js`;

const chmod = () => new Promise((rs, rj) =>
    exec(`chmod +x ${BIN} `, (err, out) => err ? rj(err) : rs(out)));

const readJSON = (path: string) =>
    Promise
        .fromCallback(cb => readFile(path, cb))
        .then(JSON.parse);

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

                        must(JSON.parse(text)).eql(expected);

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

                        must(JSON.parse(text)).eql(expected);

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

                        must(JSON.parse(text)).eql(expected);

                    })))

});

