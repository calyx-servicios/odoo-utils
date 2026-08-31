/** @odoo-module **/

import {ActionSpreadsheetOca} from "./spreadsheet_action.esm";
import {makeSpreadsheetClientAction} from "./spreadsheet_client_action.esm";
import {registry} from "@web/core/registry";

registry
    .category("actions")
    .add(
        "action_spreadsheet_oca",
        makeSpreadsheetClientAction(ActionSpreadsheetOca, "Spreadsheet Oca"),
        {force: true}
    );
