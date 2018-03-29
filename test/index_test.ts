import * as must from 'must/register';
import { Program, resolveRef, resolveListRefs, createEngine } from '../src';

const program: Program = {

    file: `${__dirname}/data/refTopLevel.json`,
    concern: '',
    cwd: process.cwd(),
    document: { type: 'string' },
    template: '',
    engine: createEngine(''),
    context: {
        types: {

            name: 'VARCHAR(64)',
            password: 'VARCHAR(128)',
            status: 'VARCHAR(32)',
            text: 'TEXT'

        }
    },
    options: <any>{},
    plugins: [],
    after: []
};

describe('resolveRef', function() {

    it('should recursively merge documents', function() {

        let path = `${__dirname}/data/refTopLevel.json`;

        return resolveRef(program)(path)(require(path))
            .then(v => must(v).eql({
                hits: [2, 3, 1],
                flags:
                {
                    horns: { ivory: false, gold: true },
                    active: true,
                    blocked: 'false'
                },
                alias: 'Agatha',
                name: 'Makeda'
            }))

    });

    it('should merge arrays', function() {

        let path = `${__dirname}/data/refArray.json`;

        return resolveRef(program)(path)(require(path))
            .then(v => must(v).eql({
                "name": "Akshun",
                "alias": "Facerasc",
                "profiles": {

                    "alias": "Bertha",
                    "flags": {
                        "blocked": "false",
                        "horns": {
                            "gold": true,
                            "ivory": false
                        }, "active": true
                    },
                    "hits": [2, 3, 1, 2, 3],
                    "name": "Makeda",
                    "type": "object",
                    "title": "Person",
                    "@sql": {
                        "table": "person",
                    },
                    "properties": {
                        "first_name": {
                            "type": "string",
                            "@sql": {
                                "type": "VARCHAR(200)"
                            }
                        }, "last_name": {
                            "type": "VARCHAR(64)"
                        }
                    }
                }
            }))

    });

});

describe('resolveListRefs', function() {

    it('should not flatten arrays', function() {

        let path = `${__dirname}/data/noFlatten.json`;

        return resolveListRefs(program)(path)(require(path))
            .then(v => must(v).eql([{
                "@sql": {
                    "table": "person"
                },
                "merged": ["<string>", ["<array>"], [["<multi-dimension>"]]],
                "properties": {
                    "first_name": {
                        "@sql": {
                            "type": "VARCHAR(200)"
                        },
                        "type": "string"
                    },
                    "last_name": {
                        "type": "VARCHAR(64)"
                    }
                },
                "title": "Person",
                "type": "object"
            },
            ["<string>", ["<array>"], [["<multi-dimension>"]]]]))

    });

});
