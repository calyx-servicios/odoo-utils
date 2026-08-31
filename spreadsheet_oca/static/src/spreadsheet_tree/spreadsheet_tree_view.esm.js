/** @odoo-module **/

/**
 * List view used by the spreadsheet menu: it adds a button to create
 * spreadsheets out of xlsx files. Odoo 15 list views are legacy widgets, hence
 * the legacy view registration instead of an owl view.
 */

import ListController from "web.ListController";
import ListView from "web.ListView";
import core from "web.core";
import viewRegistry from "web.view_registry";

const _t = core._t;

export const SpreadsheetListController = ListController.extend({
    buttons_template: "spreadsheet_oca.ListView.buttons",
    events: Object.assign({}, ListController.prototype.events, {
        "click .o_button_upload_spreadsheet": "_onUploadButtonClicked",
        "change .o_spreadsheet_file_input": "_onFileUploaded",
    }),

    /**
     * @private
     */
    _onUploadButtonClicked() {
        this.$(".o_spreadsheet_file_input").click();
    },

    /**
     * @private
     * @param {File} file
     * @returns {Promise<String>} base64 content of the file
     */
    _readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Uploaded files are stored as attachments, which are then converted into
     * spreadsheets (and removed) by ``create_document_from_attachment``.
     *
     * @private
     * @param {Event} ev
     */
    async _onFileUploaded(ev) {
        const files = Array.from(ev.target.files || []);
        if (!files.length) {
            return;
        }
        const attachmentIds = [];
        for (const file of files) {
            const attachmentId = await this._rpc({
                model: "ir.attachment",
                method: "create",
                args: [
                    {
                        name: file.name,
                        mimetype: file.type,
                        datas: await this._readFile(file),
                    },
                ],
                context: this.model.get(this.handle).getContext(),
            });
            attachmentIds.push(attachmentId);
        }
        // Let the same file be uploaded again
        ev.target.value = "";
        const action = await this._rpc({
            model: "spreadsheet.spreadsheet",
            method: "create_document_from_attachment",
            args: ["", attachmentIds],
            context: this.model.get(this.handle).getContext(),
        });
        if (action.context && action.context.notifications) {
            for (const [name, message] of Object.entries(
                action.context.notifications
            )) {
                this.displayNotification({title: name, message, sticky: true});
            }
            delete action.context.notifications;
        }
        this.do_action(action);
    },

    /**
     * @override
     */
    renderButtons() {
        this._super(...arguments);
        if (this.$buttons) {
            this.$buttons
                .find(".o_button_upload_spreadsheet")
                .attr("title", _t("Upload XLSX"));
        }
    },
});

export const SpreadsheetListView = ListView.extend({
    config: Object.assign({}, ListView.prototype.config, {
        Controller: SpreadsheetListController,
    }),
});

viewRegistry.add("spreadsheet_tree", SpreadsheetListView);
