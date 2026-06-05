from lxml import etree

from odoo import models


class ResUsers(models.Model):
    """Apply group visibility rules dynamically in users form view."""

    _inherit = "res.users"

    def get_view(self, view_id=None, view_type="form", **options):
        """Hide configured groups for the active user in access rights page."""
        result = super().get_view(view_id=view_id, view_type=view_type, **options)
        if view_type != "form" or not result.get("arch"):
            return result

        active_group_ids = set(self.env.user.groups_id.ids)
        if not active_group_ids:
            return result

        rules = self.env["group.block.rule"].sudo().search([
            ("active", "=", True),
            ("source_group_id", "in", list(active_group_ids)),
        ])
        blocked_group_ids = set(rules.mapped("blocked_group_id").ids)
        if not blocked_group_ids:
            return result

        arch_tree = etree.fromstring(result["arch"])
        updated = False

        for group_id in blocked_group_ids:
            field_name = f"in_group_{group_id}"
            for field_node in arch_tree.xpath(f"//field[@name='{field_name}']"):
                if field_node.get("invisible") != "1":
                    field_node.set("invisible", "1")
                    updated = True

        for field_node in arch_tree.xpath("//field[starts-with(@name, 'sel_groups_')]"):
            name = field_node.get("name", "")
            ids_chunk = name[11:].split("_") if name.startswith("sel_groups_") else []
            select_ids = {int(v) for v in ids_chunk if v.isdigit()}
            if select_ids.intersection(blocked_group_ids):
                if field_node.get("invisible") != "1":
                    field_node.set("invisible", "1")
                    updated = True

        if updated:
            result["arch"] = etree.tostring(arch_tree, encoding="unicode")
        return result
