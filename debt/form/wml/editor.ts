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
} from "@cdms/debt/wml/action_area";
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
                    'href': "#/debts",
                    'onClick': function function_literal_10() {
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
               
               Debts

            `)], view)], view), $$node('h2', {
                html: {},
                wml: {}
            }, [$$text(`Add Debt`)], view)], view)], view)], view), $$widget(Container, {
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
                    'id': "Number",
                    'group': "controls"
                },
                ww: {
                    'name': "number",
                    'label': "Number",
                    'value': this.values.number,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.number
                }
            }, [], view), $$widget(Input, {
                html: {},
                wml: {
                    'id': "Principal",
                    'group': "controls"
                },
                ww: {
                    'name': "principal",
                    'label': "Principal",
                    'value': this.values.principal,
                    'required': true,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.principal
                }
            }, [], view), $$widget(Input, {
                html: {},
                wml: {
                    'id': "Debtor",
                    'group': "controls"
                },
                ww: {
                    'name': "debtor",
                    'label': "Debtor",
                    'value': this.values.debtor,
                    'required': true,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.debtor
                }
            }, [], view), $$widget(Input, {
                html: {},
                wml: {
                    'id': "Client",
                    'group': "controls"
                },
                ww: {
                    'name': "client",
                    'label': "Client",
                    'value': this.values.client,
                    'required': true,
                    'onInput': this.send.bind(this),
                    'invalidate': this.errors.client
                }
            }, [], view)], view)], view)], view)], view)], view)], view)], view)
        }

    }

}