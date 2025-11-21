# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import api, fields, models


class ARCAActivity(models.Model):
    _name = "l10n_ar.arca.activity"
    _description = "ARCA Activity"
    _order = "code"
    _rec_names_search = ["name", "code"]

    code = fields.Char(string="Código", required=True, help="Código de actividad")
    name = fields.Char(string="Nombre", required=True, help="Descripción de la actividad")

    _sql_constraints = [
        ('code_unique', 'unique(code)', 'El código de actividad debe ser único.'),
        ('code_length', 'CHECK(LENGTH(code) <= 6)', 'El código de actividad no puede tener más de 6 caracteres.'),
    ]

    @api.depends("code", "name")
    @api.depends_context("formatted_display_name")
    def _compute_display_name(self):
        for activity in self:
            if activity.env.context.get("formatted_display_name"):
                activity.display_name = f"--{activity.code}--\t{activity.name}"
            else:
                activity.display_name = "%s - %s" % (activity.code, activity.name)
