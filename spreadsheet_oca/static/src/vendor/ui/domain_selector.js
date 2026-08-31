/** @odoo-module **/

/**
 * Owl 2 stand-ins for ``@web/core/domain_selector``. Odoo 15 only ships a legacy
 * (jQuery widget) domain editor, which cannot be rendered inside the spreadsheet
 * application, so the domain is displayed as text and edited as a python-like
 * literal, the same way the developer mode edits it.
 */

import {Component, useState} from "@odoo/owl";
import {Dialog} from "@spreadsheet_oca/vendor/ui/dialog";
import {Domain} from "@web/core/domain";
import {useService} from "@spreadsheet_oca/vendor/web/hooks";

export class DomainSelector extends Component {
    get domainString() {
        const value = this.props.value;
        if (!value || value === "[]") {
            return "Match all records";
        }
        return value;
    }
}
DomainSelector.template = "spreadsheet_oca.DomainSelector";

export class DomainSelectorDialog extends Component {
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            value: this.props.initialValue || "[]",
            error: false,
            matchCount: undefined,
        });
    }
    onDomainChanged(ev) {
        this.state.value = ev.target.value;
        this.state.error = false;
        this.state.matchCount = undefined;
    }
    parseDomain() {
        try {
            return new Domain(this.state.value).toList();
        } catch (error) {
            this.state.error = error.message || String(error);
            return null;
        }
    }
    async onCheck() {
        const domain = this.parseDomain();
        if (domain === null) {
            return;
        }
        try {
            this.state.matchCount = await this.orm.call(
                this.props.resModel,
                "search_count",
                [domain]
            );
        } catch (error) {
            this.state.error = error.message || String(error);
        }
    }
    onConfirm() {
        if (this.parseDomain() === null) {
            return;
        }
        this.props.onSelected(this.state.value);
        this.props.close();
    }
}
DomainSelectorDialog.template = "spreadsheet_oca.DomainSelectorDialog";
DomainSelectorDialog.components = {Dialog};
