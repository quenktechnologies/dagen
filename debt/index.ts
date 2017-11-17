import * as jhr from 'jhr';
import * as potoo from '@quenk/potoo';
import * as afpl from 'afpl';
import * as widgets from '@quenk/wml-widgets';
import * as api from '@cdms/client/api';
import * as routing from '@cdms/client/routing';
import * as chrome from '@cdms/client/chrome';
import * as app from '@cdms/client/app';
import * as form from './form';
import * as profile from './profile';
import * as layout from './wml/layout';
import { Client } from '@cdms/validation/lib/Clients';
import { Overview } from '@cdms/client/app';
import { fields } from './fields';

/**
 * id
 */
export const id = 'clients';

/**
 * Clients page
 */
export class Clients extends Overview.Overview<Client> {

    view = new layout.Main(this);

    fields = fields;

    resource = api.paths.clients;

    onSearch(name: string, value: string) {

        let term = `%"%${value}%"`;

        this.tell(api.paths.clients,
            new jhr.Methods.Get(afpl.util.fuse(this.terms, {
                [name]: `name:${term} or id:${term} or address_line1:${term} or email:${term}`
            }), { tags: { client: this.self() } }));

    }

    onRun(): void {

        this.spawn(profile);
        this.editor = this.spawn(form.create);

    }

}

/**
 * create a new Clients actor
 */
export const create = (s: potoo.System) => new Clients(s);
