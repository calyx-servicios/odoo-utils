# Copyright 2023 CreuBlanca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import re

from odoo.exceptions import AccessDenied
from odoo.http import request

from odoo.addons.bus.controllers.main import BusController


class SpreadsheetBusController(BusController):
    """Odoo 15 uses the longpolling bus: channels are sent by the client on
    every poll, so the channel sanitization that ``ir.websocket`` performs on
    newer versions has to be done here instead."""

    def _poll(self, dbname, channels, last, options):
        if request.session.uid:
            # Do not alter original list.
            channels = list(channels)
            for channel in channels:
                if not isinstance(channel, str):
                    continue
                match = re.match(r"spreadsheet_oca;(\w+(?:\.\w+)*);(\d+)", channel)
                if not match:
                    continue
                model_name = match[1]
                res_id = int(match[2])

                # Verify access to the edition channel.
                if not request.env.user._is_internal():
                    raise AccessDenied()

                if not request.env["ir.model.access"].check(
                    model_name, "read", raise_exception=False
                ):
                    continue
                # If user don't have access to the model, we don't even try to read

                document = request.env[model_name].search(
                    [("id", "=", res_id)], limit=1
                )
                # We do a search in order to apply the access rules.
                # We just need to ensure that the user can read it

                if not document.exists():
                    continue

                channels.append(
                    (
                        request.env.registry.db_name,
                        "spreadsheet_oca",
                        model_name,
                        res_id,
                    )
                )
        return super()._poll(dbname, channels, last, options)
