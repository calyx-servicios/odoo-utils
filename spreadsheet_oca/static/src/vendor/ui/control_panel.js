/** @odoo-module **/

/**
 * Owl 2 control panel: the one of the web client is an Owl 1 component tied to
 * the search model, only the breadcrumbs are needed here.
 */

import {Component} from "@odoo/owl";
import {useService} from "@spreadsheet_oca/vendor/web/hooks";

export class ControlPanel extends Component {
    setup() {
        this.actionService = useService("action");
    }
    get display() {
        const display = {
            "top-left": true,
            "top-right": true,
            "bottom-left": true,
            "bottom-right": true,
            ...(this.props.display || {}),
        };
        display.top = display["top-left"] || display["top-right"];
        display.bottom = display["bottom-left"] || display["bottom-right"];
        return display;
    }
    get breadcrumbs() {
        return (this.env.config && this.env.config.breadcrumbs) || [];
    }
    onBreadcrumbClicked(jsId) {
        this.actionService.restore(jsId);
    }
}
ControlPanel.template = "spreadsheet_oca.ControlPanel";
