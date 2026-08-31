# Copyright 2022 CreuBlanca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Spreadsheet Dashboard Oca",
    "summary": """
        Use OCA Spreadsheets on dashboards configuration""",
    "version": "15.0.1.3.0",
    "license": "AGPL-3",
    "author": "CreuBlanca,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/spreadsheet",
    # Odoo 15 has no ``spreadsheet_dashboard`` addon: its models, views and
    # client action are shipped by this module, see the vendor directories.
    "depends": ["spreadsheet_oca"],
    "data": [
        "vendor/data/security.xml",
        "vendor/data/ir.model.access.csv",
        "vendor/data/spreadsheet_dashboard_views.xml",
        "vendor/data/menu_views.xml",
        "vendor/data/dashboard.xml",
        "wizards/spreadsheet_spreadsheet_import.xml",
        "views/spreadsheet_dashboard_group_views.xml",
        "views/spreadsheet_dashboard.xml",
        "data/spreadsheet_spreadsheet_import_mode.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "spreadsheet_dashboard_oca/static/src/vendor/spreadsheet_dashboard/assets/dashboard_action_loader.js",
            "spreadsheet_dashboard_oca/static/src/vendor/spreadsheet_dashboard/bundle/dashboard_action/dashboard_action.scss",
        ],
        "spreadsheet_oca.o_spreadsheet": [
            "spreadsheet_dashboard_oca/static/src/vendor/spreadsheet_dashboard/bundle/**/*.js",
            "spreadsheet_dashboard_oca/static/src/vendor/spreadsheet_dashboard/bundle/**/*.xml",
            "spreadsheet_dashboard_oca/static/src/dashboard/dashboard_client_action.esm.js",
        ],
    },
}
