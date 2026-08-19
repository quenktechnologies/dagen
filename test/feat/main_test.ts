import * as os from 'os';

import { exec } from 'child_process';

import { Future, fromCallback } from '@quenk/noni/lib/control/monad/future';
import {
    readTextFile,
    removeFile,
    writeTextFile
} from '@quenk/noni/lib/io/file';

const SQL_DEFINITIONS = `${process.cwd()}/test/fixtures/data/definitions/sql.json`;
const TEMPLATES = `${process.cwd()}/test/fixtures/templates`;
const TS_TEMPLATE = `company.ts.dagen`;
const FAIL_TEMPLATE = 'error.ts.dagen';
const NO_SCHEMA_TEMPLATE = 'noschema.dagen';
const ORG = `${process.cwd()}/test/fixtures/data/input/org.json`;
const ORG_CHECK = `${process.cwd()}/test/fixtures/data/checks/org.json`;
const COMPANY = `${process.cwd()}/test/fixtures/data/input/company.json`;
const GENERIC_PLUGIN = `${process.cwd()}/test/fixtures/plugin/generic`;
const BIN = `${process.cwd()}/lib/main.js`;
const ACCOUNT = `${process.cwd()}/test/fixtures/data/input/account.json`;
const USER = `${process.cwd()}/test/fixtures/data/input/user.json`;
const REGEX = `${process.cwd()}/test/fixtures/data/input/regex.json`;
const PROFILE = `${process.cwd()}/test/fixtures/data/input/profile.json`;

const chmod = () => fromCallback(cb => exec(`chmod +x ${BIN} `, cb));

const fixturePath = (path: string) =>
    `${process.cwd()}/test/feat/fixtures/data/output/${path}`;

const _run = (args: string[]): Future<string> =>
    Future.fromCallback(cb => {
        exec(`${BIN} ${args.join(' ')}`, (err, text, etext) => {
            if (err) return cb(err);

            if (etext) {
              return cb(new Error(etext))
            }


            cb(undefined, text);
        });
    });

const run = async (args: string[]): Promise<string> => {
    let result = await _run(args);
    return result;
};

describe('dagen', () => {
    beforeAll(async () => {
        await chmod();
    });

    it.each([
        {
            title: 'should produce the compiled object',
            args: [
                `--templates ${TEMPLATES}`,
                `--definitions ${SQL_DEFINITIONS}`,
                `--namespace sql ${COMPANY}`
            ],
            path: `shouldProduceTheCompiledObject`
        },
        {
            title: 'should allow values to be set via --set flag',
            args: [
                `--definitions ${SQL_DEFINITIONS}`,
                `--set title="The Company Schema"`,
                `--namespace sql ${COMPANY}`
            ],
            path: 'shouldAllowValuesToBeSetViaSetFlag'
        },
        {
            title: 'should generate output',
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${TS_TEMPLATE}`,
                `--definitions ${SQL_DEFINITIONS}`,
                `--namespace ts ${COMPANY}`
            ],
            path: `shouldGenerateOutput`
        },
        {
            title: 'should apply checks',
            args: [`--check ${ORG_CHECK}`, ORG],
            path: `shouldApplyChecks`
        },
        {
            title: 'should invoke the output hook',
            args: [`--plugin ${GENERIC_PLUGIN}`, ORG],
            path: `shouldInvokeTheOutputHook`
        },
        {
            title: 'should pass config to plugins',
            args: [
                `--plugin ${GENERIC_PLUGIN}`,
                `--config generic.name=isgeneric`,
                ORG
            ],
            path: `shouldPassConfigToPlugins`
        },
        {
            title: 'should work without a schema',
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${NO_SCHEMA_TEMPLATE}`
            ],
            path: `shouldWorkWithoutASchema`
        },
        {
            title: 'should work with multiple schemas',
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${TS_TEMPLATE}`,
                `${PROFILE} ${ACCOUNT} ${USER}`
            ],
            path: `shouldWorkWithMultipleSchemas`
        },
        {
            title: 'should exclude schema',
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${TS_TEMPLATE}`,
                `--exclude meta.schema.isModel`,
                `${PROFILE} ${ACCOUNT} ${USER}`
            ],
            path: `shouldExcludeSchema`
        },
        {
            title: 'should load files with regexes',
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${TS_TEMPLATE} ${REGEX}`
            ],
            path: `shouldLoadFilesWithRegexes`
        },
        {
            title: 'should catch errors in templates',
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${FAIL_TEMPLATE}`,
                `--definitions ${SQL_DEFINITIONS}`,
                `--namespace ts ${COMPANY}`
            ],
            error: 'foo'
        },
        {
            title: 'should work with the --out flag',
            nogenerate: true,
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${TS_TEMPLATE}`,
                `--ext json`,
                `--out ${os.tmpdir()}`,
                `${PROFILE}`
            ],
            outPath: `${os.tmpdir()}/profile.json`,
            path: `shouldWorkWithTheOutFlag`
        },
        {
            title: 'should work with a relative --out flag',
            args: [
                `--templates ${TEMPLATES}`,
                `--template ${TS_TEMPLATE}`,
                `--ext json`,
                `--out .`,
                `${PROFILE}`
            ],
            outPath: PROFILE,
            path: `shouldWorkWithARelativeOutFlag`
        }
    ])('$title', async ({ args, error, path, outPath, nogenerate }) => {
        if (process.env.GENERATE) {
            if (error || nogenerate) {
                return;
            }

            let result = await run(args);
            await writeTextFile(fixturePath(path), result);
            return;
        }

        if (error) {
            let msg;
            try {
                await run(args);
            } catch (e) {
              console.error('THE ERROR ', e);
                msg = (e.message as Error).message;
            }
console.error('msg is se ', msg);
            expect(msg.includes(error)).toBe(true);
            return;
        }

        let result = await run(args);

        if (outPath) {
            result = await readTextFile(outPath);
        }

        let expected = await readTextFile(fixturePath(path));
        expect(result).equal(expected);
    });

    afterAll(async () => {
        await removeFile('./profile.json');
    });
});
