/** @odoo-module **/

/**
 * Minimal Owl 2 dialog, plus the tiny dialog "service" used by the side panels.
 *
 * The dialog service of the web client cannot be used here: it instantiates Owl
 * 1 components inside the web client application, while everything living in the
 * spreadsheet bundle runs on the sandboxed Owl 2 runtime. Dialogs are therefore
 * rendered by the spreadsheet application itself.
 */

import {Component, useState} from "@odoo/owl";

export class Dialog extends Component {
    get title() {
        return this.props.title || "Odoo";
    }
    onClose() {
        if (this.props.close) {
            this.props.close();
        }
        if (this.props.onClosed) {
            this.props.onClosed();
        }
    }
}
Dialog.template = "spreadsheet_oca.Dialog";

export class DialogContainer extends Component {}
DialogContainer.template = "spreadsheet_oca.DialogContainer";
DialogContainer.components = {};

/**
 * Builds the state and the API shared through the sub environment as
 * ``env.spreadsheetDialogs``. ``add`` mimics the signature of the dialog
 * service: ``add(ComponentClass, props, options)``.
 */
export function useDialogService() {
    const state = useState({dialogs: []});
    let dialogId = 1;
    const service = {
        add(Comp, props = {}, options = {}) {
            const id = dialogId++;
            const close = () => service.close(id, options);
            state.dialogs.push({id, Comp, props: {...props, close}, options});
            return close;
        },
        close(id, options = {}) {
            const index = state.dialogs.findIndex((dialog) => dialog.id === id);
            if (index === -1) {
                return;
            }
            state.dialogs.splice(index, 1);
            if (options.onClose) {
                options.onClose();
            }
        },
    };
    return {state, service};
}
