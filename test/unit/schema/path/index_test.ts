import { must } from '@quenk/must';
import { expand } from '../../../../src/schema/path';

describe('path', () => {

    it('should expand all the paths', () => {

        must(expand({
            root: {
                'name.first': 'Lasana',
                name: { last: 'Murray', 'middle.name': 'K' },
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
                    middle: {

                        name: 'K'

                    }
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

    it('should observe escaped dots', () => {

        must(expand({
            root: {
                'name\\.first': 'Lasana',
                name: { last: 'Murray' },
            }
        })).equate({

            root: {

                'name.first': 'Lasana',
                name: {

                    last: 'Murray',
                }

            }

        })

    });

});
