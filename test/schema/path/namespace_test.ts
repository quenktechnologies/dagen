import * as must from 'must/register';
import { normalize } from '../../../src/schema/path/namespace';

const schema = {

    'type': 'object',
    'sql:table': 'user',
    'properties': {

        'sql:name': 'VARCHAR(200)',
        'js:name': { 'type': 'string' },
        'name': 'string'

    },
    'age': {

        'sql:type': 'INT',
        'js:type': 'number',
        'type': 'age',
        'validation:check': 'nameCheck',
    },
    'tags': {

        'type': 'array',
        'etc:mode': 25,
        'validation:value': ['user', 'admin', 'registered'],

    }

};

describe('namespace', () => {

    describe('normalize', () => {

        it('should normalize a schema based on the list', () => {

            let nss = ['sql', 'js', 'validation'];

            let r = {

                'type': 'object',
                'table': 'user',
                'properties': {

                    'name': { 'type': 'string' }

                },
                'age': {

                    'type': 'number',
                    'check': 'nameCheck',

                },
                'tags': {

                    'type': 'array',
                    'value': ['user', 'admin', 'registered'],

                }

            }

            must((normalize(nss)(schema))).eql(r);

        });

    });

});
