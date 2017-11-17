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
    empty
} from "@cdms/client/wml/tables";



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
            }, [$$widget(Container, {
                html: {},
                wml: {}
            }, [$$widget(Row, {
                html: {},
                wml: {}
            }, [$$widget(Column, {
                html: {},
                wml: {},
                ww: {
                    'width': 6
                }
            }, [$$node('h1', {
                html: {},
                wml: {}
            }, [$$text(`Clients`)], view)], view), $$widget(Column, {
                html: {},
                wml: {},
                ww: {
                    'width': 6
                }
            }, [$$widget(Button, {
                html: {},
                wml: {},
                ww: {
                    'style': "-warning",
                    'class': "-right",
                    'text': "Add User",
                    'onClick': function function_literal_6() {
                        return this.tell(this.self(), 'create');
                    }.bind(this)
                }
            }, [], view)], view)], view), $$widget(Row, {
                html: {},
                wml: {}
            }, [$$widget(Column, {
                html: {},
                wml: {}
            }, [$$if(!this.data, function if2() {
                return $$widget(BusyIndicator, {
                    html: {},
                    wml: {}
                }, [], view)
            }.bind(this), function else_clause2() {
                return $$widget(Panel, {
                    html: {},
                    wml: {}
                }, [$$widget(PanelBody, {
                    html: {},
                    wml: {}
                }, [$$widget(Search, {
                    html: {},
                    wml: {},
                    ww: {
                        'placeholder': "Search..",
                        'name': "q",
                        'onSearch': this.onSearch.bind(this)
                    }
                }, [], view), $$widget(Table, {
                    html: {},
                    wml: {
                        'id': "results"
                    },
                    ww: {
                        'fields': this.fields,
                        'data': this.data,
                        'model': new SortTableModel(),
                        'emptyMacro': empty
                    }
                }, [], view)], view)], view)
            }.bind(this))], view)], view)], view)], view)], view)
        }

    }

}