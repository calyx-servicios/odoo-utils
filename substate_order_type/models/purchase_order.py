# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class PurchaseOrder(models.Model):
    _inherit = "purchase.order"

    @api.depends("order_type")
    def _compute_substate_domain(self):
        """Recompute substate domain when order_type changes."""
        for order in self:
            order.substate_id = order._get_default_substate_id(
                order.state
            )

    def _get_default_substate_domain(self, state_val=False):
        """Add order_type filter to substate domain.

        Substates with no purchase_order_type_ids are considered
        universal and always shown.
        """
        domain = super()._get_default_substate_domain(state_val)
        order_type_id = False
        if self:
            order_type_id = self.order_type.id
        if order_type_id:
            domain += [
                "|",
                ("purchase_order_type_ids", "=", False),
                ("purchase_order_type_ids", "in", [order_type_id]),
            ]
        return domain

    @api.onchange("order_type")
    def _onchange_order_type_substate(self):
        """Update substate and its domain when order type changes."""
        self.substate_id = self._get_default_substate_id(self.state)
        return {
            "domain": {
                "substate_id": self._get_substate_id_domain(),
            }
        }

    def _get_substate_id_domain(self):
        """Build the dynamic domain for substate_id field."""
        domain = [
            ("model", "=", "purchase.order"),
            (
                "target_state_value_id.target_state_value",
                "=",
                self.state,
            ),
        ]
        if self.order_type:
            domain += [
                "|",
                ("purchase_order_type_ids", "=", False),
                ("purchase_order_type_ids", "in", [self.order_type.id]),
            ]
        return domain
