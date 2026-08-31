# Copyright 2022 CreuBlanca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Spreadsheet Oca",
    "summary": """
        Allow to edit spreadsheets""",
    "version": "15.0.1.9.2",
    "license": "AGPL-3",
    "author": "CreuBlanca,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/spreadsheet",
    # Odoo 15 has no ``spreadsheet`` addon: o-spreadsheet and the odoo layer
    # built on top of it are shipped by this module, see static/src/vendor.
    "depends": ["web", "base_sparse_field", "bus"],
    "data": [
        "security/security.xml",
        "security/ir.model.access.csv",
        "views/spreadsheet_spreadsheet.xml",
        "data/spreadsheet_spreadsheet_import_mode.xml",
        "wizards/spreadsheet_select_row_number.xml",
        "wizards/spreadsheet_spreadsheet_import.xml",
    ],
    "demo": ["demo/spreadsheet_spreadsheet.xml"],
    "assets": {
        "web.assets_backend": [
            # The o-spreadsheet styles use the scss variables of the web
            # client, they are compiled with the backend bundle
            "spreadsheet_oca/static/src/vendor/spreadsheet/o_spreadsheet/o_spreadsheet_extended.scss",
            "spreadsheet_oca/static/src/spreadsheet/spreadsheet.scss",
            # ``vendor/web/assets`` is required by the lazy loader below, so it
            # belongs to this bundle: a module can only be defined in one bundle
            "spreadsheet_oca/static/src/vendor/web/assets.js",
            "spreadsheet_oca/static/src/spreadsheet/spreadsheet_action.esm.js",
            "spreadsheet_oca/static/src/vendor/spreadsheet/assets_backend/constants.js",
            "spreadsheet_oca/static/src/vendor/spreadsheet/assets_backend/spreadsheet_action_loader.js",
            "spreadsheet_oca/static/src/spreadsheet/pivot_view.esm.js",
            "spreadsheet_oca/static/src/spreadsheet/graph_view.esm.js",
            "spreadsheet_oca/static/src/spreadsheet/list_controller.esm.js",
            "spreadsheet_oca/static/src/spreadsheet_tree/spreadsheet_tree_view.esm.js",
        ],
        # In Odoo 15 every qweb template (owl and legacy) lives in this bundle
        "web.assets_qweb": [
            "spreadsheet_oca/static/src/spreadsheet/pivot_view.xml",
            "spreadsheet_oca/static/src/spreadsheet/graph_view.xml",
            "spreadsheet_oca/static/src/spreadsheet/list_controller.xml",
            "spreadsheet_oca/static/src/spreadsheet_tree/spreadsheet_tree_view.xml",
        ],
        # Lazily loaded when a spreadsheet is opened, see the controller
        # /spreadsheet_oca/bundle and @spreadsheet_oca/vendor/web/assets
        "spreadsheet_oca.o_spreadsheet": [
            # Owl 2 runtime, sandboxed as window.owl2: the web client of Odoo 15
            # runs on Owl 1 and keeps using the global ``owl``
            "spreadsheet_oca/static/src/vendor/owl2/owl2.js",
            "spreadsheet_oca/static/src/vendor/owl2/owl2_module.js",
            # listed before the glob below: paths are deduplicated, the first
            # occurrence sets the position in the bundle
            "spreadsheet_oca/static/src/vendor/spreadsheet/o_spreadsheet/o_spreadsheet.js",
            # web/assets.js is loaded with web.assets_backend, see above
            "spreadsheet_oca/static/src/vendor/web/hooks.js",
            "spreadsheet_oca/static/src/vendor/web/utils.js",
            "spreadsheet_oca/static/src/vendor/ui/*.js",
            "spreadsheet_oca/static/src/vendor/spreadsheet/**/*.js",
            (
                "remove",
                "spreadsheet_oca/static/src/vendor/spreadsheet/assets_backend/**/*",
            ),
            # o-spreadsheet templates first, so that they can be inherited
            "spreadsheet_oca/static/src/vendor/spreadsheet/o_spreadsheet/o_spreadsheet.xml",
            "spreadsheet_oca/static/src/vendor/spreadsheet/**/*.xml",
            "spreadsheet_oca/static/src/vendor/ui/*.xml",
            "spreadsheet_oca/static/src/pivot/pivot_table.esm.js",
            "spreadsheet_oca/static/src/spreadsheet/utils/dynamic_generators.esm.js",
            "spreadsheet_oca/static/src/spreadsheet/bundle/*.js",
            "spreadsheet_oca/static/src/spreadsheet/bundle/spreadsheet.xml",
        ],
    },
}
