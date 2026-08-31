/** @odoo-module **/

/**
 * Bridge between the Owl 1 web client of Odoo 15 and the Owl 2 spreadsheet
 * application.
 *
 * The whole spreadsheet bundle (o-spreadsheet and every component around it) is
 * written for Owl 2, which cannot be mixed in the same component tree as the Owl
 * 1 runtime of the web client. Client actions displaying a spreadsheet are
 * therefore Owl 1 components whose only job is to mount a standalone Owl 2
 * application in their own dom element.
 */

import {loadSpreadsheetTemplates} from "@spreadsheet_oca/vendor/web/assets";
import {useSetupAction} from "@web/webclient/actions/action_hook";

const {Component, tags} = owl;
const {App} = window.owl2;

export const SPREADSHEET_BUNDLE = "spreadsheet_oca.o_spreadsheet";

/**
 * @param {Component} RootComponent owl 2 component to mount
 * @param {String} name application name, shown in the owl devtools
 * @returns {Component} owl 1 client action
 */
export function makeSpreadsheetClientAction(RootComponent, name) {
    class SpreadsheetClientAction extends Component {
        setup() {
            this.app = undefined;
            this.root = undefined;
            useSetupAction({
                beforeLeave: () =>
                    this.root && this.root.beforeLeave && this.root.beforeLeave(),
            });
        }
        async willStart() {
            this.templates = await loadSpreadsheetTemplates(SPREADSHEET_BUNDLE);
        }
        async mounted() {
            this.app = new App(RootComponent, {
                name,
                env: this.spreadsheetEnv(),
                templates: this.templates,
                props: {
                    action: this.props.action,
                    breadcrumbs: this.props.breadcrumbs || [],
                },
                dev: Boolean(this.env.debug),
                translateFn: this.env._t,
            });
            this.root = await this.app.mount(this.el);
        }
        willUnmount() {
            if (this.app) {
                this.app.destroy();
                this.app = undefined;
                this.root = undefined;
            }
        }
        /**
         * The web client environment is reused as is: services are plain objects
         * and do not depend on the owl runtime.
         *
         * It has to be *inherited*, not copied: the environments of Odoo 15 are
         * built by the owl 1 ``useSubEnv``, which chains them with
         * ``Object.create``. Copying the own keys of ``this.env`` would drop
         * everything coming from the parents, the services first of all. Owl 2
         * keeps the prototype of the environment it is given.
         */
        spreadsheetEnv() {
            const env = Object.create(this.env);
            env.config = {
                ...(this.env.config || {}),
                breadcrumbs: (this.env.config && this.env.config.breadcrumbs) || [],
            };
            return env;
        }
    }
    SpreadsheetClientAction.template = tags.xml/* xml */ `
        <div class="o_spreadsheet_oca_client_action h-100 w-100" />`;
    return SpreadsheetClientAction;
}
