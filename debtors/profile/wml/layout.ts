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
    Column,
    Row
} from "@quenk/wml-widgets";
import {
    BusyIndicator,
    Fragment,
    Table,
    SortTableModel,
    Button
} from "@quenk/wml-widgets";
import {
    Panel,
    PanelBody
} from "@quenk/wml-widgets";
import {
    Search
} from "@cdms/client/ui/ww";
import {
    search
} from "@cdms/client/wml/action_area";
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
            }, [search.call(this, view, ), $$widget(MainView, {
                html: {},
                wml: {}
            }, [$$if(!this.data, function if6() {
                return $$widget(BusyIndicator, {
                    html: {},
                    wml: {}
                }, [], view)
            }.bind(this), function else_clause6() {
                return $$widget(Container, {
                    html: {},
                    wml: {}
                }, [$$widget(Row, {
                    html: {},
                    wml: {}
                }, [$$widget(Column, {
                    html: {},
                    wml: {},
                    ww: {
                        'width': 7
                    }
                }, [$$node('h3', {
                    html: {},
                    wml: {}
                }, [$$domify(`${this.data.first_name} ${this.data.last_name}`)], view)], view), $$widget(Column, {
                    html: {},
                    wml: {},
                    ww: {
                        'width': 5
                    }
                }, [$$widget(Button, {
                    html: {},
                    wml: {},
                    ww: {
                        'style': "-warning",
                        'class': "-right",
                        'text': "Edit",
                        'onClick': function function_literal_13() {
                            return this.tell(this.self(), Form.EDIT);
                        }.bind(this)
                    }
                }, [], view)], view)], view)], view)
            }.bind(this))], view)], view)
        }

    }

}