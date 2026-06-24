# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class BaseSubstate(models.Model):
    _inherit = "base.substate"

    purchase_order_type_ids = fields.Many2many(
        comodel_name="purchase.order.type",
        string="Tipos de Orden de Compra",
        help="Si se establece, este subestado solo estará disponible para órdenes de compra "
        "con los tipos seleccionados. Dejar vacío para todos los tipos.",
    )
