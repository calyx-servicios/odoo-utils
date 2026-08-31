/** @odoo-module **/

/**
 * The dashboard action is an Owl 2 component: it is mounted by the Owl 1 bridge
 * of spreadsheet_oca, like the spreadsheet action itself.
 */

import {SpreadsheetDashboardAction} from "@spreadsheet_dashboard_oca/vendor/spreadsheet_dashboard/bundle/dashboard_action/dashboard_action";
import {makeSpreadsheetClientAction} from "@spreadsheet_oca/spreadsheet/bundle/spreadsheet_client_action.esm";
import {registry} from "@web/core/registry";

registry
    .category("actions")
    .add(
        "action_spreadsheet_dashboard",
        makeSpreadsheetClientAction(SpreadsheetDashboardAction, "Spreadsheet Dashboard"),
        {force: true}
    );
