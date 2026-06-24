# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Substate Order Type",
    "version": "18.0.1.0.0",
    "category": "Purchase Management",
    "summary": "Filter purchase substates by purchase order type",
    "author": "Calyx Servicios S.A.",
    "maintainers": ["Calyx"],
    "license": "AGPL-3",
    "depends": [
        "purchase_substate",
        "purchase_order_type",
    ],
    "data": [
        "views/base_substate_views.xml",
        "views/purchase_views.xml",
    ],
    "installable": True,
    "auto_install": False,
}
