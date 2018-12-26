import { Object } from '@quenk/noni/lib/data/json';

export const string = 'this is a string';

export const number = 12;

export const boolean = true;

export const object = {

    name: 'Otis Juma',

    age: 24,

    profile: 1256,

    flags: {

        active: true,

        locked: false,

        outstanding: true

    },

    tags: ['user', 'active', 'unlocked'],

    contact: {

        home: '6995534',

        email: 'me@meme.com',

        fax: 'N/A'

    }

};

export const array = [{ id: 1 }, { id: 12 }, { id: 24 }];

export const sum = true;

export const ref = { yes: true };

export const all: Object = {

    string,
    number,
    boolean,
    object,
    array,
    sum,
    ref

}

export const withChecks = {

    name: 'Larry',

    clients: {

        bmobile: 6,
        ttec: 10,
        cal: 7

    },
    flags: [25, 48, 32],

    profile: '     UnAME    '

};

export const withChecksWrong = {

    name: 'larry',

    clients: {

        bmobile: '6',
        ttec: 210,
        cal: [7]

    },
    flags: [25, 100, 48, 9],

    profile: 'parolor'

};

export const mangledNestedArraySample = {
    'title': 'Company',
    'type': 'object',
    'sql:table': 'company',
    'ts:module': 'entities',
    'procedures': {

        'create': {

            'imports': {

                'Settings as SettingsType': '@anole/types/lib/Settings'

            },
            'parameters': {

                'data': 'SettingsType'

            }

        }

    },
    'extras': ['a','b','c']

}
