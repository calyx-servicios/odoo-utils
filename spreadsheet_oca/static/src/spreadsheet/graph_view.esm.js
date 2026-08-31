/** @odoo-module **/
// Odoo 15 has no graph controller: the (owl) graph view is both view and controller
import {GraphView} from "@web/views/graph/graph_view";

import {patch} from "web.utils";

patch(
    GraphView.prototype,
    "spreadsheet_oca/static/src/spreadsheet/graph_view.esm.js",
    {
        onSpreadsheetButtonClicked() {
            this.actionService.doAction(
                "spreadsheet_oca.spreadsheet_spreadsheet_import_act_window",
                {
                    additionalContext: {
                        default_name: this.model.metaData.title,
                        default_datasource_name: this.model.metaData.title,
                        default_import_data: {
                            mode: "graph",
                            metaData: JSON.parse(JSON.stringify(this.model.metaData)),
                            searchParams: JSON.parse(
                                JSON.stringify(this.model.searchParams)
                            ),
                        },
                    },
                }
            );
        },
    }
);
