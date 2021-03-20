import test from 'ava';

import { mix } from '../helpers/mix.js';

test('it executes the callback based on the condition', t => {
    let called = false;

    mix.when(false, () => {
        called = true;
    });

    t.false(called);

    mix.when(true, () => {
        called = true;
    });

    t.true(called);
});

test('it passes the mix instance to the callback', t => {
    mix.when(true, _mix => t.deepEqual(mix, _mix));
});
