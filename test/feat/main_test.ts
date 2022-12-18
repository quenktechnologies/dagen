import * as os from 'os';

import {
    exec
} from 'child_process';

import {
    assert
} from '@quenk/test/lib/assert';
import {
    Future,
    pure,
    toPromise,
    fromCallback,
    doFuture,
    voidPure
} from '@quenk/noni/lib/control/monad/future';
import {
    readTextFile
} from '@quenk/noni/lib/io/file';

const SQL_DEFINITIONS = `${__dirname}/../fixtures/data/definitions/sql.json`;
const TEMPLATES = `${__dirname}/../fixtures/templates`;
const TS_TEMPLATE = `company.ts.dagen`;
const FAIL_TEMPLATE = 'error.ts.dagen';
const NO_SCHEMA_TEMPLATE = 'noschema.dagen';
const ORG = `${__dirname}/../fixtures/data/input/org.json`;
const ORG_CHECK = `${__dirname}/../fixtures/data/checks/org.json`;
const COMPANY_TS = `${__dirname}/../fixtures/data/output/company_ts.json`;
const ORG_JSON = `${__dirname}/../fixtures/data/output/org.json`;
const COMPANY = `${__dirname}/../fixtures/data/input/company.json`;
const COMPANY_SQL = `${__dirname}/../fixtures/data/output/company_sql.json`;
const GENERIC_PLUGIN = `${__dirname}/../fixtures/plugin/generic`;
const BIN = `${__dirname}/../../lib/main.js`;
const ACCOUNT = `${__dirname}/../fixtures/data/input/account.json`;
const USER = `${__dirname}/../fixtures/data/input/user.json`;
const PROFILE = `${__dirname}/../fixtures/data/input/profile.json`;

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

                        assert(JSON.parse(text)).equate(expected);

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

                        assert(JSON.parse(text)).equate(expected);

                    }))))

    it('should generate output', () =>
        toPromise(chmod()
            .chain(() => run(
                `--templates ${TEMPLATES} ` +
                `--template ${TS_TEMPLATE} ` +
                `--definitions ${SQL_DEFINITIONS} ` +
                `--namespace ts ${COMPANY} `))
            .chain((text: string) =>
                readJSON(COMPANY_TS)
                    .map((expected: string) => {

                        assert(JSON.parse(text)).equate(expected);

                    }))))

    it('should catch errors in templates', () =>
        toPromise(chmod()
            .chain(() => run(
                `--templates ${TEMPLATES} ` +
                `--template ${FAIL_TEMPLATE} ` +
                `--definitions ${SQL_DEFINITIONS} ` +
                `--namespace ts ${COMPANY} `))
            .catch(e => {
                console.error(e);
                return pure('true')
            })
            .map((r: string) => assert(r).equal('true'))))

    it('should apply checks', () =>
        toPromise(chmod()
            .chain(() => run(
                `--check ${ORG_CHECK} ${ORG} `))
            .chain((text: string) =>
                readJSON(ORG_JSON)
                    .map((expected: string) => {

                        assert(JSON.parse(text)).equate(expected);

                    }))))

    it('should invoke the output hook', () => {

        return toPromise(chmod()
            .chain(() => run(`--plugin ${GENERIC_PLUGIN} ${ORG} `))
            .map((text: string) => {

                let o = JSON.parse(text);

                assert(o.GENERIC_PLUGIN_BEFORE_OUTPUT).equal('yes');

            }))

    })

    it('should pass config to plugins', () => {

        return toPromise(chmod()
            .chain(() => run(
                `--plugin ${GENERIC_PLUGIN} ` +
                `--config generic.name=isgeneric ${ORG} `))
            .map((text: string) => {

                let o = JSON.parse(text);

                assert(o.name).equal('isgeneric');

            }))

    })

    it('should work without a schema', () =>
        toPromise(chmod()
            .chain(() => run(
                `--templates ${TEMPLATES} ` +
                `--template ${NO_SCHEMA_TEMPLATE}`))
            .map((text: string) => {

                assert(text.trim()).equal('what did you expect?');

            })))

    it('should work with multiple schemas', () => doFuture(function*() {

        yield chmod();

        let result = yield run(`--templates ${TEMPLATES} ` +
            `--template ${TS_TEMPLATE} ` +
            `${PROFILE} ${ACCOUNT} ${USER}`);

        let path = `${__dirname}/../fixtures/data/output/` +
            `shouldWorkWithMultipleSchemas`;

        let expected = yield readTextFile(path);

        assert(result).equal(expected);

        return voidPure;

    }))

    it('should exclude schema', () => doFuture(function*() {

        yield chmod();

        let result = yield run(`--templates ${TEMPLATES} ` +
            `--template ${TS_TEMPLATE} ` +
            `--exclude meta.schema.isModel ` +
            `${PROFILE} ${ACCOUNT} ${USER}`);

        let path = `${__dirname}/../fixtures/data/output/` +
            `shouldExcludeSchema`;

        let expected = yield readTextFile(path);

        assert(result).equal(expected);

        return voidPure;

    }))

    it('should work with the --out flag', () => doFuture(function*() {

        yield chmod();

        yield run(`--templates ${TEMPLATES} ` +
            `--template ${TS_TEMPLATE} ` +
            `--ext json ` +
            `--out ${os.tmpdir()} ` +
            `${PROFILE}`);

        let result = yield readTextFile(`${os.tmpdir()}/profile.json`);

        let expected = yield readTextFile(
            `${__dirname}/../fixtures/data/output/profile.json`);

        assert(result).equal(expected);

        return voidPure;

    }))

})
