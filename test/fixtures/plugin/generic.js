const future = require('@quenk/noni/lib/control/monad/future');

module.exports = (ctx) => ({

    name: '',

    configure(c) {

        if(c.generic)
            this.name = c.generic.name;

        return future.pure(c);


    },

    checkSchema() {

        return future.pure([{

            type: 'object',

            properties: {

                timestamp: {

                    type: 'number',

                    optional: true

                }

            }
        }]);

    },

    beforeOutput(s) {

        s.GENERIC_PLUGIN_BEFORE_OUTPUT = 'yes';
        s.name = this.name;
        return future.pure(s);

    },

    configureGenerator(g) {

        return future.pure(g);

    }

})
