import {
    empty as $$empty,
    box as $$box,
    resolve as $$resolve,
    text as $$text,
    node as $$node,
    widget as $$widget,
    ifE as $$if,
    forE as $$for,
    switchE as $$switch,
    domify as $$domify,
    AppView
} from "@quenk/wml-runtime";

import {
    User
} from "@cdms/validation/lib/Users";

export function username < Z > (view: AppView < Z > , username: string, _: string, user: User) {
    return $$node('a', {
        html: {
            'href': `#/users/${user.id}`
        },
        wml: {}
    }, [$$domify(username)], view);
}