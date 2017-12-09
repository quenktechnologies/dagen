import * as must from 'must/register';
import { resolveRef } from '../src';

describe('resolveRef', function() {

    xit('should recursively merge documents', function() {

        let path = `${__dirname}/data/refTopLevel.json`;

        return resolveRef(path)(require(path))
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

        return resolveRef(path)(require(path))
            .then(v => console.error('-------------_> ', JSON.stringify(v), '\n') || must(v).eql({
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
                    "@sql:table": "person",
                    "properties": {
                        "first_name": {
                            "type": "string",
                            "@sql:type": "VARCHAR(200)"
                        }, "last_name": {
                            "type": "${types.name}"
                        }
                    }
                }
            }))

    });

});

