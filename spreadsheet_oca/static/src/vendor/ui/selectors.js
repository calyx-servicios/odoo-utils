/** @odoo-module **/

/**
 * Owl 2 replacements for the record/model/field pickers of the Odoo 16 view
 * framework (``Many2OneField``, ``ModelSelector``, ``ModelFieldSelector``,
 * ``Many2XAutocomplete`` and ``TagsList``). Odoo 15 has no equivalent that can
 * be mounted in the spreadsheet application, so lightweight components built on
 * top of the orm service are used instead. They keep the same props as the
 * components used by the original templates.
 */

import {Component, onWillStart, onWillUpdateProps, useState} from "@odoo/owl";
import {useService} from "@spreadsheet_oca/vendor/web/hooks";

/**
 * Text input with a dropdown of suggestions.
 *
 * props:
 *  - search: async (term) => [{value, label}]
 *  - onSelect: (option) => void
 *  - value: displayed value
 *  - placeholder, clearOnSelect, disabled
 */
export class AutoComplete extends Component {
    setup() {
        this.state = useState({
            open: false,
            options: [],
            term: this.props.value || "",
        });
        onWillUpdateProps((nextProps) => {
            if (nextProps.value !== this.props.value) {
                this.state.term = nextProps.value || "";
            }
        });
    }
    async loadOptions(term) {
        this.state.options = await this.props.search(term);
        this.state.open = true;
    }
    onInput(ev) {
        this.state.term = ev.target.value;
        this.loadOptions(this.state.term);
    }
    onFocus() {
        this.loadOptions(this.props.searchOnFocusTerm === false ? this.state.term : "");
    }
    onBlur() {
        // Let the click on an option happen before closing the dropdown
        setTimeout(() => {
            this.state.open = false;
        }, 200);
    }
    onSelect(option) {
        this.state.open = false;
        this.state.term = this.props.clearOnSelect ? "" : option.label;
        this.props.onSelect(option);
    }
}
AutoComplete.template = "spreadsheet_oca.AutoComplete";

/**
 * Replacement of ``@web/core/model_selector/model_selector``.
 * props: value, models (technical names), onModelSelected({technical, label})
 */
export class ModelSelector extends Component {
    setup() {
        this.orm = useService("orm");
    }
    async search(term) {
        const domain = [];
        if (this.props.models && this.props.models.length) {
            domain.push(["model", "in", this.props.models]);
        }
        if (term) {
            domain.push("|", ["name", "ilike", term], ["model", "ilike", term]);
        }
        const records = await this.orm.searchRead(
            "ir.model",
            domain,
            ["model", "name"],
            {limit: 20}
        );
        return records.map((record) => ({
            value: record.model,
            label: `${record.name} (${record.model})`,
            name: record.name,
        }));
    }
    onSelect(option) {
        this.props.onModelSelected({technical: option.value, label: option.name});
    }
}
ModelSelector.template = "spreadsheet_oca.ModelSelector";
ModelSelector.components = {AutoComplete};

/**
 * Replacement of ``@web/core/model_field_selector/model_field_selector``.
 * Fields of related models are reachable by following the relations, the
 * resulting chain (``partner_id.country_id.name``) is given back through
 * ``update``.
 *
 * props: fieldName, resModel, readonly, isDebugMode, update(chain)
 */
export class ModelFieldSelector extends Component {
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            open: false,
            fields: [],
            // model and chain currently browsed in the popover
            browsedModel: this.props.resModel,
            browsedChain: "",
        });
        onWillStart(() => this.loadFields(this.props.resModel));
        onWillUpdateProps((nextProps) => {
            if (nextProps.resModel !== this.props.resModel) {
                this.state.browsedModel = nextProps.resModel;
                this.state.browsedChain = "";
                return this.loadFields(nextProps.resModel);
            }
            return undefined;
        });
    }
    async loadFields(model) {
        const fields = await this.orm.call(model, "fields_get", [
            false,
            ["string", "type", "relation", "searchable"],
        ]);
        this.state.fields = Object.entries(fields)
            .map(([name, field]) => ({...field, name}))
            .filter((field) => field.searchable !== false)
            .sort((a, b) => (a.string || a.name).localeCompare(b.string || b.name));
    }
    get chain() {
        return this.props.fieldName || "";
    }
    toggle() {
        if (this.props.readonly) {
            return;
        }
        this.state.open = !this.state.open;
    }
    close() {
        this.state.open = false;
    }
    fullChain(field) {
        return this.state.browsedChain
            ? `${this.state.browsedChain}.${field.name}`
            : field.name;
    }
    selectField(field) {
        this.props.update(this.fullChain(field));
        this.close();
    }
    async followRelation(field) {
        this.state.browsedChain = this.fullChain(field);
        this.state.browsedModel = field.relation;
        await this.loadFields(field.relation);
    }
    async goBack() {
        const parts = this.state.browsedChain.split(".");
        parts.pop();
        this.state.browsedChain = parts.join(".");
        this.state.browsedModel = await this.modelOfChain(this.state.browsedChain);
        await this.loadFields(this.state.browsedModel);
    }
    async modelOfChain(chain) {
        let model = this.props.resModel;
        for (const part of chain.split(".").filter(Boolean)) {
            const fields = await this.orm.call(model, "fields_get", [
                [part],
                ["relation"],
            ]);
            model = fields[part] && fields[part].relation;
        }
        return model;
    }
    onChainEdited(ev) {
        this.props.update(ev.target.value);
    }
}
ModelFieldSelector.template = "spreadsheet_oca.ModelFieldSelector";

/**
 * Replacement of the ``Many2OneField`` used to link a chart to an Odoo menu.
 * props: value ([id, name] or false), update([id, name] or false)
 */
export class MenuSelector extends Component {
    setup() {
        this.menus = useService("menu");
    }
    get displayName() {
        return this.props.value ? this.props.value[1] : "";
    }
    search(term) {
        const search = (term || "").toLowerCase();
        return this.menus
            .getAll()
            .filter((menu) => menu.id !== "root" && menu.name)
            .filter((menu) => menu.name.toLowerCase().includes(search))
            .slice(0, 20)
            .map((menu) => ({value: menu.id, label: menu.name}));
    }
    onSelect(option) {
        this.props.update([option.value, option.label]);
    }
    onClear() {
        this.props.update(false);
    }
}
MenuSelector.template = "spreadsheet_oca.MenuSelector";
MenuSelector.components = {AutoComplete};

/**
 * Replacement of ``@spreadsheet/global_filters/components/records_selector``.
 * props: resModel, resIds, onValueChanged(records), placeholder
 */
export class RecordsSelector extends Component {
    setup() {
        this.orm = useService("orm");
        this.displayNames = {};
        this.state = useState({names: {}});
        onWillStart(() =>
            this.fetchMissingDisplayNames(this.props.resModel, this.resIds(this.props))
        );
        onWillUpdateProps((nextProps) =>
            this.fetchMissingDisplayNames(nextProps.resModel, this.resIds(nextProps))
        );
    }
    resIds(props) {
        return props.resIds || [];
    }
    get tags() {
        return this.resIds(this.props).map((id) => ({
            id,
            text: this.state.names[id] || "...",
        }));
    }
    async fetchMissingDisplayNames(resModel, recordIds) {
        const missing = recordIds.filter((id) => !(id in this.state.names));
        if (!missing.length || !resModel) {
            return;
        }
        const records = await this.orm.read(resModel, missing, ["display_name"]);
        for (const record of records) {
            this.state.names[record.id] = record.display_name;
        }
    }
    async search(term) {
        const results = await this.orm.call(this.props.resModel, "name_search", [], {
            name: term || "",
            args: [["id", "not in", this.resIds(this.props)]],
            limit: 20,
        });
        return results.map(([id, label]) => ({value: id, label}));
    }
    onSelect(option) {
        this.state.names[option.value] = option.label;
        this.notifyChange(this.resIds(this.props).concat([option.value]));
    }
    removeRecord(recordId) {
        this.notifyChange(this.resIds(this.props).filter((id) => id !== recordId));
    }
    notifyChange(selectedIds) {
        this.props.onValueChanged(
            selectedIds.map((id) => ({id, display_name: this.state.names[id]}))
        );
    }
}
RecordsSelector.template = "spreadsheet_oca.RecordsSelector";
RecordsSelector.components = {AutoComplete};
RecordsSelector.defaultProps = {resIds: []};
