/**
 * Odoo 15 ships Owl 1 as the global ``owl``. o-spreadsheet and every component
 * living in the spreadsheet bundle are written for Owl 2, so a second, isolated
 * Owl runtime is loaded as ``window.owl2`` and exposed under the module name the
 * Owl 2 sources expect. The Odoo 15 web client keeps using ``window.owl``.
 */
odoo.define("@odoo/owl", function () {
    "use strict";
    return window.owl2;
});
