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
    MainView,
    Container,
    Row,
    Column,
    Panel,
    PanelBody
} from "@quenk/wml-widgets";
import {
    Input,
    Button,
    Select,
    Fragment,
    BreadCrumbs,
    Crumb
} from "@quenk/wml-widgets";
import {
    editor
} from "@cdms/debtor/wml/action_area";
import {
    Icon
} from "@cdms/client/ui/fa";
import {
    Form
} from "@cdms/client/app";



export class Main < C > extends AppView < C > {

    constructor(context: C) {

        super(context);

        let view = this;

        this.template = function() {
            return $$widget(Fragment, {
                html: {},
                wml: {}
            }, [editor.call(this, view, ''), $$widget(MainView, {
                html: {},
                wml: {}
            }, [$$widget(Container, {
                html: {},
                wml: {}
            }, [$$widget(Row, {
                html: {},
                wml: {}
            }, [$$widget(Column, {
                html: {},
                wml: {}
            }, [$$widget(BreadCrumbs, {
                html: {},
                wml: {}
            }, [$$widget(Crumb, {
                html: {},
                wml: {},
                ww: {
                    'href': "#/debtors",
                    'onClick': function function_literal_12() {
                        return this.tell(this.self(), Form.CANCEL);
                    }.bind(this),
                    'anchorClass': "-unstyled-link"
                }
            }, [$$widget(Icon, {
                html: {},
                wml: {},
                fa: {
                    'type': "hand-o-left"
                }
            }, [], view), $$text(` 
               
               Debtors

            `)], view)], view), $$node('h2', {
                html: {},
                wml: {}
            }, [$$text(`Add Debtor`)], view)], view)], view)], view), $$widget(Container, {
                html: {},
                wml: {},
                ww: {
                    'class': "-top-border"
                }
            }, [$$widget(Row, {
                html: {},
                wml: {}
            }, [$$widget(Column, {
                html: {},
                wml: {},
                ww: {
                    'class': "col-md-4"
                }
            }, [$$node('h5', {
                html: {},
                wml: {}
            }, [$$text(`Details`)], view)], view), $$widget(Column, {
                html: {},
                wml: {},
                ww: {
                    'class': "col-md-8"
                }
            }, [$$widget(Panel, {
                html: {},
                wml: {}
            }, [$$widget(PanelBody, {
                html: {},
                wml: {}
            }, [$$widget(Input, {
                html: {},
                wml: {
                    'id': "Code",
                    'group': "controls"
                },
                ww: {
                    'name': "code",
                    'label': "Code",
                    'value': this.values.code,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.code
                }
            }, [], view), $$widget(Input, {
                html: {},
                wml: {
                    'id': "First Name",
                    'group': "controls"
                },
                ww: {
                    'name': "first_name",
                    'label': "First Name",
                    'value': this.values.first_name,
                    'required': true,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.first_name
                }
            }, [], view), $$widget(Input, {
                html: {},
                wml: {
                    'id': "Last Name",
                    'group': "controls"
                },
                ww: {
                    'name': "last_name",
                    'label': "Last Name",
                    'value': this.values.last_name,
                    'required': true,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.last_name
                }
            }, [], view), $$widget(Input, {
                html: {},
                wml: {
                    'id': "Date of Birth",
                    'group': "controls"
                },
                ww: {
                    'name': "date_of_birth",
                    'label': "Date of Birth",
                    'value': this.values.date_of_birth,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.date_of_birth
                }
            }, [], view)], view)], view)], view)], view)], view)], view)], view)
        }

    }

}