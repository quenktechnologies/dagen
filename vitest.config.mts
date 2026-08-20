import { defineConfig } from 'vitest/config';

export default defineConfig({

    test: {

        globals: true,

        environment: 'node',

        include: ['test/**/*_test.ts'],

        setupFiles: ['test/vitest.setup.ts'],

        reporters: ['verbose'],

        testTimeout: 10000

    }

});
