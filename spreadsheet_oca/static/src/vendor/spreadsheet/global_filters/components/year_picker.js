/** @odoo-module **/

/**
 * Owl 2 year picker. The upstream one extends the ``DatePicker`` of the web
 * client, which is an Owl 1 component in Odoo 15 (and relies on the bootstrap
 * datetimepicker widget), so a plain year input is used instead.
 */

import {Component} from "@odoo/owl";

const {DateTime} = luxon;

export class YearPicker extends Component {
    get year() {
        return this.props.date ? this.props.date.year : "";
    }
    onChange(ev) {
        const year = parseInt(ev.target.value, 10);
        if (isNaN(year)) {
            this.props.onDateTimeChanged(undefined);
            return;
        }
        this.props.onDateTimeChanged(DateTime.local().set({year}));
    }
}
YearPicker.template = "spreadsheet_oca.YearPicker";
