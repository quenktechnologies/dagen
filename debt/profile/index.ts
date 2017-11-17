import * as potoo from '@quenk/potoo';
import * as layout from './wml/layout';
import * as api from '@cdms/client/api';
import * as routing from '@cdms/client/routing';
import * as form from '../form';
import {Profile} from '@cdms/client/app';
import { Users } from '@cdms/validation';

/**
 * id 
 */
export const id = "profile"

/**
 * User profile.
 *
 * Currently allows user to
 * 1. View profile information.
 * 2. Edit user information.
 */
export class User extends Profile.Profile<Users.User> {

    view = new layout.Main(this);

    resource = api.paths.user;

    onRequest({ request: { params } }: routing.Request): void {

        this.kill(this.editor);
        this.editor = this.spawn(form.edit, [params.id]);

    }

}

/**
 * create a new User actor
 */
export const create = (s: potoo.System) => new User(s);
