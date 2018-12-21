import {must} from '@quenk/must';
import { expand } from '../../../../src/schema/path';

describe('path', () => {

    it('should expand all the paths', () => {

        must(expand({
            root: {
                'name.first': 'Lasana',
                name: { last: 'Murray' },
                level: 'master',
                'options.flags.enabled': [0, 1, 0, 1, 0, 1, 0, 1],
                'options.flags': { version: 3 }
            }
        })).equate({

            root: {

                level: 'master',
                name: {

                    first: 'Lasana',
                    last: 'Murray',
                },
                options: {

                    flags: {

                        enabled: [0, 1, 0, 1, 0, 1, 0, 1],

                        version: 3

                    }

                }

            }

        })

    });

});
