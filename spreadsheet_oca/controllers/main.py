# Copyright 2024 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import json
from io import BytesIO
from zipfile import ZipFile

from odoo.http import Controller, content_disposition, request, route


class SpreadsheetDownloadXLSX(Controller):
    @route("/spreadsheet/xlsx", type="http", auth="user", methods=["POST"])
    def download_spreadsheet_xlsx(self, zip_name, files, **kw):
        if hasattr(files, "read"):
            files = files.read().decode("utf-8")
        files = json.loads(files)
        file_bytes = BytesIO()
        with ZipFile(file_bytes, "w") as zip_file:
            for file in files:
                zip_file.writestr(file["path"], file["content"])
        file_content = file_bytes.getvalue()
        return request.make_response(
            file_bytes.getvalue(),
            [
                ("Content-Length", len(file_content)),
                ("Content-Type", "application/vnd.ms-excel"),
                ("X-Content-Type-Options", "nosniff"),
                ("Content-Disposition", content_disposition(zip_name)),
            ],
        )


class SpreadsheetBundle(Controller):
    """Odoo 15 cannot lazily load the javascript of a bundle: ``loadBundle`` only
    handles the qweb templates. This route mimics the ``/web/bundle`` route of
    newer versions so that the spreadsheet bundle (o-spreadsheet is ~2Mb) is only
    downloaded when a spreadsheet is actually opened."""

    @route("/spreadsheet_oca/bundle/<string:bundle_name>", type="json", auth="user")
    def spreadsheet_oca_bundle(self, bundle_name, **kwargs):
        debug = request.session.debug or ""
        nodes = request.env["ir.qweb"]._get_asset_nodes(bundle_name, debug=debug)
        js_libs = []
        css_libs = []
        for tag, attrs, _content in nodes:
            if tag == "script" and attrs.get("src"):
                js_libs.append(attrs["src"])
            elif tag == "link" and attrs.get("href"):
                css_libs.append(attrs["href"])
        return {"jsLibs": js_libs, "cssLibs": css_libs}
