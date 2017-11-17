import * as jhr from 'jhr';
import * as potoo from '@quenk/potoo';
import * as preconditions from '@quenk/preconditions';
import * as app from '@cdms/client/app';
import * as api from '@cdms/client/api';
import { Debtor } from '@cdms/validation';
import { Main } from './wml/editor';

export const create = {
    id: 'create-client',
    create: (s: potoo.System) => new CreateClientForm(s)
};

export const edit = {
    id: 'edit-client',
    create: (s: potoo.System, id: string) => new EditClientForm(s, id)
};

/**
 * CreateClientForm is used to create new clients.
 */
export class CreateClientForm<V> extends app.Form.Form<V> {

    view = new Main(this);

    onCheck<A>(key: string, value: A, cb: app.Form.CheckCallback<A, V>): void {

        return cb(Debtor.debtor[key](value));

    }

    onSave(o: app.Form.Data<V>) {

        this.tell(api.paths.clients, new jhr.Methods.Post(o, { tags: { client: this.self() } }));

    }

}

export class EditClientForm<V> extends CreateClientForm<V> {

    constructor(s: potoo.System, public id: string) { super(s); }

    onSave(o: app.Form.Data<V>) {

        this.tell(api.paths.client,
            new jhr.Methods.Patch(o, {
                context: { id: this.id }, tags: { client: this.self() }
            }));

    }

}

