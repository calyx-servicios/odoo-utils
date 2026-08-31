/** @odoo-module */

import {Domain} from "@web/core/domain";
import {MenuSelector} from "@spreadsheet_oca/vendor/ui/selectors";
import spreadsheet from "@spreadsheet_oca/vendor/spreadsheet/o_spreadsheet/o_spreadsheet_extended";
import {useService} from "@spreadsheet_oca/vendor/web/hooks";

const {chartSidePanelComponentRegistry} = spreadsheet.registries;
const {LineBarPieDesignPanel} = spreadsheet.components;
const {Component} = window.owl2;

export class OdooPanel extends Component {
    setup() {
        this.menus = useService("menu");
    }
    get menuId() {
        const menu = this.env.model.getters.getChartOdooMenu(this.props.figureId);
        if (menu) {
            return [menu.id, menu.name];
        }
        return false;
    }
    updateMenu(menuId) {
        if (!menuId) {
            this.env.model.dispatch("LINK_ODOO_MENU_TO_CHART", {
                chartId: this.props.figureId,
                odooMenuId: false,
            });
            return;
        }
        const menu = this.env.model.getters.getIrMenu(menuId[0]);
        this.env.model.dispatch("LINK_ODOO_MENU_TO_CHART", {
            chartId: this.props.figureId,
            odooMenuId: menu.xmlid || menu.id,
        });
    }
    get record() {
        const menus = this.menus
            .getAll()
            .map((menu) => menu.id)
            .filter((menuId) => menuId !== "root");
        return {
            getFieldDomain: function () {
                return new Domain([["id", "in", menus]]);
            },
            getFieldContext: function () {
                return {};
            },
        };
    }
}
OdooPanel.template = "spreadsheet_oca.OdooPanel";
OdooPanel.components = {MenuSelector};

class OdooStackablePanel extends OdooPanel {
    onChangeStacked(ev) {
        this.props.updateChart(this.props.figureId, {
            stacked: ev.target.checked,
        });
    }
}
OdooStackablePanel.template = "spreadsheet_oca.OdooStackablePanel";

chartSidePanelComponentRegistry
    .add("odoo_line", {
        configuration: OdooStackablePanel,
        design: LineBarPieDesignPanel,
    })
    .add("odoo_bar", {
        configuration: OdooStackablePanel,
        design: LineBarPieDesignPanel,
    })
    .add("odoo_pie", {
        configuration: OdooPanel,
        design: LineBarPieDesignPanel,
    });
