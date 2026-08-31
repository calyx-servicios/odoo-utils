/** @odoo-module **/

/**
 * The list view of Odoo 15 is still a legacy (widget based) view: the button is
 * added to the legacy controller instead of patching the owl controller and its
 * renderer as newer versions do.
 */

import ListController from "web.ListController";
import session from "web.session";

ListController.include({
    events: Object.assign({}, ListController.prototype.events, {
        "click .o_list_export_spreadsheet": "_onSpreadsheetButtonClicked",
    }),

    /**
     * Columns shown in the list, binary ones excluded.
     *
     * @private
     * @param {Object} state
     * @returns {Object[]} [{name, type}]
     */
    _getSpreadsheetColumns(state) {
        return this.renderer.columns
            .filter(
                (column) =>
                    column.tag === "field" &&
                    state.fields[column.attrs.name] &&
                    state.fields[column.attrs.name].type !== "binary"
            )
            .map((column) => ({
                name: column.attrs.name,
                type: state.fields[column.attrs.name].type,
            }));
    },

    /**
     * The user part of the context (lang, tz, uid, ...) is not stored on the
     * spreadsheet: it is added back by the server on every read.
     *
     * @private
     * @param {Object} context
     * @returns {Object}
     */
    _cleanSpreadsheetContext(context) {
        const userContextKeys = Object.keys(session.user_context || {});
        const result = {};
        for (const key of Object.keys(context)) {
            if (!userContextKeys.includes(key)) {
                result[key] = context[key];
            }
        }
        return result;
    },

    /**
     * @private
     */
    _onSpreadsheetButtonClicked() {
        const state = this.model.get(this.handle);
        const displayName = this.getTitle();
        this.do_action("spreadsheet_oca.spreadsheet_spreadsheet_import_act_window", {
            additional_context: {
                default_name: displayName,
                default_datasource_name: displayName,
                default_can_be_dynamic: true,
                default_dynamic: true,
                default_is_tree: true,
                default_number_of_rows: Math.min(state.count, state.limit),
                default_import_data: {
                    mode: "list",
                    metaData: {
                        model: state.model,
                        domain: state.getDomain(),
                        orderBy: state.orderedBy,
                        context: this._cleanSpreadsheetContext(state.getContext()),
                        columns: this._getSpreadsheetColumns(state),
                        fields: state.fields,
                        name: displayName,
                    },
                },
            },
        });
    },
});
