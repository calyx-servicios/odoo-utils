/** @odoo-module **/

import {Component, onWillStart, useState, useSubEnv} from "@odoo/owl";
import {Dialog, DialogContainer, useDialogService} from "@spreadsheet_oca/vendor/ui/dialog";
import {DataSources} from "@spreadsheet_oca/vendor/spreadsheet/data_sources/data_sources";
import {loadSpreadsheetDependencies} from "@spreadsheet_oca/vendor/spreadsheet/helpers/helpers";
import {migrate} from "@spreadsheet_oca/vendor/spreadsheet/o_spreadsheet/migration";
import spreadsheet from "@spreadsheet_oca/vendor/spreadsheet/o_spreadsheet/o_spreadsheet_extended";
import {useService} from "@spreadsheet_oca/vendor/web/hooks";
import {waitForDataLoaded} from "@spreadsheet_oca/vendor/spreadsheet/actions/spreadsheet_download_action";

const {Spreadsheet, Model} = spreadsheet;
const uuidGenerator = new spreadsheet.helpers.UuidGenerator();

class SpreadsheetTransportService {
    constructor(orm, bus_service, model, res_id) {
        this.orm = orm;
        this.bus_service = bus_service;
        this.model = model;
        this.res_id = res_id;
        this.channel = "spreadsheet_oca;" + this.model + ";" + this.res_id;
        this.bus_service.addChannel(this.channel);
        // Odoo 15 uses the longpolling bus, whose service is a legacy widget:
        // notifications are dispatched through the ``on`` method.
        this.bus_service.on("notification", this, this.onNotification.bind(this));
        this.listeners = [];
    }
    onNotification(notifications) {
        for (const {payload, type} of notifications) {
            if (
                type === "spreadsheet_oca" &&
                payload.res_model === this.model &&
                payload.res_id === this.res_id
            ) {
                // What shall we do if no callback is defined (empty until onNewMessage...) :/
                for (const {callback} of this.listeners) {
                    callback(payload);
                }
            }
        }
    }
    sendMessage(message) {
        this.orm.call(this.model, "send_spreadsheet_message", [[this.res_id], message]);
    }
    onNewMessage(id, callback) {
        this.listeners.push({id, callback});
    }
    leave(id) {
        this.listeners = this.listeners.filter((listener) => listener.id !== id);
    }
}

export class SpreadsheetRenderer extends Component {
    setup() {
        this.orm = useService("orm");
        this.bus_service = useService("bus_service");
        this.user = useService("user");
        this.ui = useService("ui");
        this.action = useService("action");
        const dataSources = new DataSources(this.orm);
        this.state = useState({
            dialogDisplayed: false,
            dialogTitle: "Spreadsheet",
            dialogContent: undefined,
        });
        this.confirmDialog = this.closeDialog;
        this.spreadsheet_model = new Model(
            migrate(this.props.record.spreadsheet_raw),
            {
                evalContext: {env: this.env, orm: this.orm},
                transportService: new SpreadsheetTransportService(
                    this.orm,
                    this.bus_service,
                    this.props.model,
                    this.props.res_id
                ),
                client: {
                    id: uuidGenerator.uuidv4(),
                    name: this.user.name,
                },
                mode: this.props.record.mode,
                dataSources,
            },
            this.props.record.revisions
        );
        // Side panels open their dialogs through the application itself: the
        // dialog service of the web client runs on owl 1 and cannot render the
        // owl 2 components of the bundle.
        const {state: dialogState, service: dialogService} = useDialogService();
        this.dialogs = dialogState;
        useSubEnv({
            saveSpreadsheet: this.onSpreadsheetSaved.bind(this),
            editText: this.editText.bind(this),
            askConfirmation: this.askConfirmation.bind(this),
            downloadAsXLXS: this.downloadAsXLXS.bind(this),
            raiseError: this.raiseError.bind(this),
            spreadsheetDialogs: dialogService,
        });
        this.env.registerRenderer(this);
        onWillStart(async () => {
            await loadSpreadsheetDependencies();
            await dataSources.waitForAllLoaded();
            await this.env.importData(this.spreadsheet_model);
        });
        dataSources.addEventListener("data-source-updated", () => {
            const sheetId = this.spreadsheet_model.getters.getActiveSheetId();
            this.spreadsheet_model.dispatch("EVALUATE_CELLS", {sheetId});
        });
    }
    closeDialog() {
        this.state.dialogDisplayed = false;
        this.state.dialogTitle = "Spreadsheet";
        this.state.dialogContent = undefined;
        this.state.dialogHideInputBox = false;
    }
    onSpreadsheetSaved() {
        const data = this.spreadsheet_model.exportData();
        this.env.saveRecord({spreadsheet_raw: data});
        this.spreadsheet_model.leaveSession();
    }
    editText(title, callback, options) {
        this.state.dialogContent = options.placeholder;
        this.state.dialogTitle = title;
        this.state.dialogDisplayed = true;
        this.confirmDialog = () => {
            callback(this.state.dialogContent);
            this.closeDialog();
        };
    }
    askConfirmation(content, confirm) {
        this.state.dialogContent = content;
        this.state.dialogDisplayed = true;
        this.state.dialogHideInputBox = true;
        this.confirmDialog = () => {
            confirm();
            this.closeDialog();
        };
    }
    async downloadAsXLXS() {
        this.ui.block();
        await waitForDataLoaded(this.spreadsheet_model);
        await this.action.doAction({
            type: "ir.actions.client",
            tag: "action_download_spreadsheet",
            params: {
                name: this.props.record.name,
                xlsxData: this.spreadsheet_model.exportXLSX(),
            },
        });
        this.ui.unblock();
    }
    raiseError(content) {
        this.state.dialogContent = content;
        this.confirmDialog = this.closeDialog;
        this.state.dialogDisplayed = true;
        this.state.dialogHideInputBox = true;
    }
}

SpreadsheetRenderer.template = "spreadsheet_oca.SpreadsheetRenderer";
SpreadsheetRenderer.components = {
    Spreadsheet,
    Dialog,
    DialogContainer,
};
SpreadsheetRenderer.props = {
    record: Object,
    res_id: {type: Number, optional: true},
    model: String,
    importData: {type: Function, optional: true},
};
