/** @odoo-module **/

/**
 * Utilities the web client of Odoo 15 does not provide yet (they are part of
 * ``@web/core/utils/objects`` and ``@web/core/utils/concurrency`` from Odoo 16
 * onwards).
 */

/**
 * @param {Object} object
 * @param {...String} properties
 * @returns {Object} a copy of ``object`` without the given properties
 */
export function omit(object, ...properties) {
    const result = {};
    const propertiesSet = new Set(properties);
    for (const key in object) {
        if (!propertiesSet.has(key)) {
            result[key] = object[key];
        }
    }
    return result;
}

/**
 * A promise that can be resolved or rejected from the outside.
 */
export class Deferred {
    constructor() {
        let resolve = null;
        let reject = null;
        const prom = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return Object.assign(prom, {resolve, reject});
    }
}
