from odoo import fields, models


class GroupBlockRule(models.Model):
    """Mapping rule: if user belongs to source group, hide blocked group fields."""

    _name = "group.block.rule"
    _description = "Group Block Rule"
    _order = "source_group_id, blocked_group_id"

    active = fields.Boolean(default=True)
    source_group_id = fields.Many2one(
        comodel_name="res.groups",
        string="Source group",
        required=True,
        ondelete="cascade",
    )
    blocked_group_id = fields.Many2one(
        comodel_name="res.groups",
        string="Blocked group",
        required=True,
        ondelete="cascade",
    )

    _sql_constraints = [
        (
            "source_blocked_unique",
            "unique(source_group_id, blocked_group_id)",
            "This source/blocked group mapping already exists.",
        ),
        (
            "source_blocked_diff",
            "check(source_group_id != blocked_group_id)",
            "Source and blocked group must be different.",
        ),
    ]
