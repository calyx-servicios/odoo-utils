/** @odoo-module **/

/**
 * Odoo 15 ``@web/core/assets`` neither exposes ``loadJS`` nor is able to lazy
 * load the javascript of a bundle (``loadBundle`` only handles the qweb
 * templates). ``getBundle``/``loadBundle`` reproduce here the API of newer
 * versions, on top of the ``/spreadsheet_oca/bundle`` route.
 */

import {loadAssets, loadBundleTemplates} from "@web/core/assets";

const bundleCache = {};

/**
 * @param {String} url
 * @returns {Promise} resolved once the script has been loaded
 */
export async function loadJS(url) {
    await loadAssets({jsLibs: [url]});
}

/**
 * @param {String} url
 * @returns {Promise} resolved once the stylesheet has been loaded
 */
export async function loadCSS(url) {
    await loadAssets({cssLibs: [url]});
}

/**
 * @param {String} bundleName name of the bundle, as declared in the manifest
 * @param {Function} rpc the rpc service
 * @returns {Promise<{cssLibs: String[], jsLibs: String[], name: String}>}
 */
export async function getBundle(bundleName, rpc) {
    if (!bundleCache[bundleName]) {
        bundleCache[bundleName] = rpc(`/spreadsheet_oca/bundle/${bundleName}`, {}).then(
            (response) => ({...response, name: bundleName})
        );
    }
    return bundleCache[bundleName];
}

/**
 * @param {{cssLibs: String[], jsLibs: String[]}} bundle
 */
export async function loadBundle(bundle) {
    await Promise.all((bundle.cssLibs || []).map(loadCSS));
    // Scripts must be loaded one after the other: o_spreadsheet.js needs its owl
    // runtime to be already available and the plugins need o_spreadsheet.
    for (const url of bundle.jsLibs || []) {
        await loadJS(url);
    }
}

/**
 * The qweb templates of the bundle, needed to instantiate the Owl 2 application.
 *
 * @param {String} bundleName
 * @returns {Promise<XMLDocument>}
 */
export async function loadSpreadsheetTemplates(bundleName) {
    return loadBundleTemplates(bundleName);
}
