import * as must from 'must/register';
import * as Promise from 'bluebird';
import {
    exec
} from 'child_process';

const TEMPLATES = `${__dirname}/templates`;
const DOC = `${__dirname}/data/user.json`;
const BIN = `${__dirname}/../lib/cli.js`;
const SQL_CONTEXT = `${__dirname}/data/sql_context.json`;

const sqlOutput = {
    "title": "User",
    "table": "users",
    "type": "object",
    "properties": {
        "id": {
            "type": "INT",
            "readOnly": true
        },
        "username": {
            "type": "VARCHAR(64)",
            "readOnly": true,
            "table": "users"
        },
        "password": {
            "type": "VARCHAR(128)"
        },
        "profile": {
            "type": "sum",
            "variants": {
                "Person": {
                    "title": "Person",
                    "table": "person",
                    "type": "object",
                    "properties": {
                        "first_name": {
                            "type": "VARCHAR(200)"
                        },
                        "last_name": {
                            "type": "VARCHAR(64)"
                        }
                    }
                },
                "Company": {
                    "title": "Company",
                    "table": "company",
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "VARCHAR(64)"
                        },
                        "mailing_address": {
                            "type": "object",
                            "title": "Address",
                            "table": "address",
                            "properties": {
                                "name": {
                                    "type": "VARCHAR(64)",
                                    "table": "names"
                                },
                                "line1": {
                                    "type": "TEXT"
                                },
                                "line2": {
                                    "type": "TEXT"
                                },
                                "town": {
                                    "type": "TEXT"
                                },
                                "state": {
                                    "type": "TEXT"
                                },
                                "country": {
                                    "type": "TEXT"
                                }
                            }
                        }
                    }
                }
            }
        },
        "address": {
            "type": "object",
            "title": "Address",
            "table": "address",
            "properties": {
                "name": {
                    "type": "VARCHAR(64)",
                    "table": "names"
                },
                "line1": {
                    "type": "TEXT"
                },
                "line2": {
                    "type": "TEXT"
                },
                "town": {
                    "type": "TEXT"
                },
                "state": {
                    "type": "TEXT"
                },
                "country": {
                    "type": "TEXT"
                }
            }
        },
        "status": {
            "type": "VARCHAR(32)",
            "readOnly": true
        }
    }
}

const procedureTemplateOutput = `
DROP PROCEDURE IF EXISTS \`TEST\`;
SHOW WARNINGS;
CREATE PROCEDURE \`TEST\`(IN _id INT)
BEGIN

  SELECT id,username,password,profile,address,status FROM test WHERE id = _id;


END;
`
const chmod = () => new Promise((rs, rj) =>
    exec(`chmod +x ${BIN}`, (err, out) => err ? rj(err) : rs(out)));

describe('dagen', () => {

    it('should have the correct context when concern spefified', () =>
        chmod()
            .then(() => new Promise((onGood, onBad) =>

                exec(`${BIN} --templates ${TEMPLATES} --context ${SQL_CONTEXT} --concern sql ${DOC}`, (err, text, etext) => {
                    if (err) return onBad(err);

                    if (etext)
                        console.error(text, etext);

                    must(JSON.parse(text)).eql(sqlOutput);

                    onGood();

                }))))

    it('should generate a template correctly', () =>

        chmod()
            .then(() => new Promise((rs, rj) =>

                exec(`${BIN} --context ${SQL_CONTEXT} --plugin sql --template test/templates/procedure.sql ${DOC}`, (err, text, etext) => {
                    if (err) return rj(err);

                    if (etext)
                        console.error(etext);

                    must(text.trim()).eql(procedureTemplateOutput.trim());

                    rs();

                }))))

    it('should allow setting values via --set', () =>

        chmod()
            .then(() => new Promise((rs, rj) =>

                exec(`${BIN} --context ${SQL_CONTEXT} ` +
                    `--plugin sql ` +
                    `--set document.value=value ` +
                    `--set document.string=require://${__dirname}/data/./string ` +
                    `${DOC}`, (err, text, etext) => {

                        if (err) return rj(err);

                        if (etext)
                            console.error(etext);

                        must(JSON.parse(text)).eql(require('./data/sqlContextWithSets'));

                        rs();

                    }))))

    it('should allow passing args to plugins', () =>

        chmod()
            .then(() => new Promise((rs, rj) =>

                exec(`${BIN} --context ${SQL_CONTEXT} ` +
                    `--plugin "[sql --list 1 --list 2 --list 3]" ` +
                    `--template test/templates/args.sql ` +
                    `${DOC}`, (err, text, etext) => {

                        if (err) return rj(err);

                        if (etext)
                            console.error(etext);

                        must(text.trim()).eql('{"--list":["1","2","3"]}');
                        rs();

                    }))))

});

