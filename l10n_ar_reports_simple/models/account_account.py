# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import fields, models


class AccountAccount(models.Model):
    _inherit = 'account.account'

    l10n_ar_arca_activity_id = fields.Many2one(
        'l10n_ar.arca.activity',
        string='Actividad ARCA asociada',
        help=(
            "Argentina: Este campo sirve para asociar una actividad específica a utilizar con esta cuenta."
            "Si no se establece, se utilizará la actividad predeterminada de la compañía."
            "La actividad se usará al generar los informes de IVA ARCA."
        ),
    )
