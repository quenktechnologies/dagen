import { must } from '@quenk/must';
import { isRef, pull } from '../../../../src/schema/definitions/usage';

const schema = {

    type: 'object',
    properties: {

        id: { type: 'number' },

        clan: { type: '#string' },

        name: { type: '#name' },

        age: { type: '#age' },

        status: { type: '#status' },

        alias: { type: 'object', properties: { name: { type: '#name' } } }

    },
    additionalProperties: {

        type: '#string'

    }

}

const p = pull({})('');

describe('ref', () => {

    describe('isRef', () => {

        it('should work', () => {

            must(isRef({ type: '#reference' })).equal(true);

            must(isRef({ type: 'reference' })).equal(false);

        });

    });

    describe('pull', () => {

        it('should pull correct Usages', () => {

            must(p(schema)).equate({
                'properties.clan': 'string',
                'properties.name': 'name',
                'properties.age': 'age',
                'properties.status': 'status',
                'properties.alias.properties.name': 'name',
                'additionalProperties': 'string'
            });

        });

    });

});
