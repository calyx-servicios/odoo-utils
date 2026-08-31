/** @odoo-module **/

/**
 * Replacement of the ``FormViewDialog`` on ``spreadsheet.select.row.number``:
 * form view dialogs of Odoo 15 are legacy widgets and cannot be opened from the
 * spreadsheet application. The very same values are asked here.
 */

import {Component, useState} from "@odoo/owl";
import {Dialog} from "@spreadsheet_oca/vendor/ui/dialog";

export class RowsColsDialog extends Component {
    setup() {
        this.state = useState({
            dynamic_rows: false,
            number_of_rows: 0,
            dynamic_cols: false,
            number_of_cols: 0,
        });
    }
    onConfirm() {
        this.props.onConfirm({
            dynamic_rows: this.state.dynamic_rows,
            number_of_rows: Number(this.state.number_of_rows) || 0,
            dynamic_cols: this.state.dynamic_cols,
            number_of_cols: Number(this.state.number_of_cols) || 0,
        });
        this.props.close();
    }
}
RowsColsDialog.template = "spreadsheet_oca.RowsColsDialog";
RowsColsDialog.components = {Dialog};
