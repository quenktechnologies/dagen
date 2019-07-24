const future = require('@quenk/noni/lib/control/monad/future');

module.exports = (ctx) => ({

    beforeOutput(s) {

        s.GENERIC_PLUGIN_BEFORE_OUTPUT = 'yes';
        return future.pure(s);

    },

    configureGenerator(g) {

        return future.pure(g);

    }

})
