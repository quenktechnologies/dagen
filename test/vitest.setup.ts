import { describe, it } from 'vitest';

// Mocha's BDD interface aliases skipped tests as xit/xdescribe.
(globalThis as any).xit = it.skip;
(globalThis as any).xdescribe = describe.skip;
