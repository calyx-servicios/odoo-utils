/** @odoo-module **/

import {Component} from "@odoo/owl";
import {ControlPanel} from "@spreadsheet_oca/vendor/ui/control_panel";

const {useState} = window.owl2;

export class SpreadsheetName extends Component {
    setup() {
        this.state = useState({
            name: this.props.name,
        });
    }
    _onNameChanged(ev) {
        if (ev.target.value) {
            this.env.saveRecord({name: ev.target.value});
        }
        this.state.name = ev.target.value;
    }
}
SpreadsheetName.template = "spreadsheet_oca.SpreadsheetName";

export class SpreadsheetControlPanel extends ControlPanel {}
SpreadsheetControlPanel.template = "spreadsheet_oca.SpreadsheetControlPanel";
SpreadsheetControlPanel.components = {
    SpreadsheetName,
};
