# Copyright 2023 Odoo S.A.
# License LGPL-3 (backport of the method shipped by the ``web`` addon of Odoo 16)

from odoo import api, models


class IrModel(models.Model):
    _inherit = "ir.model"

    @api.model
    def display_name_for(self, models):
        """Returns the display names of the given models, restricted to the ones
        the current user can access.

        The method is provided by the ``web`` addon from Odoo 16 onwards; the
        spreadsheet side panels use it to show the model of a data source.

        :models list(str): technical model names (e.g. ``["res.partner"]``)
        :return: list of dicts ``{"model", "display_name"}``
        """
        accessible_models = []
        not_accessible_models = []
        for model in models:
            if self._check_model_access(model):
                accessible_models.append(model)
            else:
                not_accessible_models.append({"display_name": model, "model": model})
        return self._display_name_for(accessible_models) + not_accessible_models

    @api.model
    def _display_name_for(self, models):
        records = self.sudo().search_read([("model", "in", models)], ["name", "model"])
        return [
            {"display_name": model["name"], "model": model["model"]}
            for model in records
        ]

    @api.model
    def _check_model_access(self, model):
        return (
            self.env.user._is_internal()
            and model in self.env
            and self.env[model].check_access_rights("read", raise_exception=False)
        )
