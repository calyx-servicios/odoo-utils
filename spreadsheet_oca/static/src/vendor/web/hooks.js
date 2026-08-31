/** @odoo-module **/

/**
 * Owl 2 flavour of the hooks Odoo 15 only provides for Owl 1
 * (``@web/core/utils/hooks``). Every component of the spreadsheet bundle runs on
 * the sandboxed Owl 2 runtime, so it cannot use the hooks of the web client.
 */

import {status, useComponent, useEffect} from "@odoo/owl";

/**
 * @param {EventBus} bus an Owl 2 EventBus, an Owl 1 EventBus or any emitter
 *      exposing either ``addEventListener`` or ``on``
 */
export function useBus(bus, eventName, callback) {
    const component = useComponent();
    useEffect(
        () => {
            const listener = callback.bind(component);
            if (bus.addEventListener) {
                bus.addEventListener(eventName, listener);
                return () => bus.removeEventListener(eventName, listener);
            }
            // Owl 1 event bus, as used by the Odoo 15 web client
            bus.on(eventName, component, listener);
            return () => bus.off(eventName, component);
        },
        () => []
    );
}

/**
 * Same contract as the standard ``useService``: it returns the service and
 * makes sure that no callback of an asynchronous call is executed once the
 * component has been destroyed.
 */
export function useService(serviceName) {
    const component = useComponent();
    const service = getService(component.env, serviceName);
    if (service && typeof service === "object") {
        return protectService(service, component);
    }
    return service;
}

/**
 * Not every service of Odoo 15 lives in the environment of the web client:
 * ``bus_service`` is still a legacy one, declared in ``core.serviceRegistry``
 * and only instantiated in the legacy environment. The web client keeps that
 * environment in ``owl.Component.env`` -- the owl 1 runtime, not the sandboxed
 * owl 2 of this bundle -- which is how the core addons themselves reach it,
 * see ``bus/static/src/js/services/assets_watchdog_service.js``.
 */
function getService(env, serviceName) {
    const services = env.services || {};
    if (serviceName in services) {
        return services[serviceName];
    }
    const legacyEnv = window.owl && window.owl.Component && window.owl.Component.env;
    const legacyServices = (legacyEnv && legacyEnv.services) || {};
    if (serviceName in legacyServices) {
        return legacyServices[serviceName];
    }
    throw new Error(`Service ${serviceName} is not available`);
}

function protectService(service, component) {
    return new Proxy(service, {
        get(target, prop) {
            const value = target[prop];
            if (typeof value !== "function") {
                return value;
            }
            return (...args) => {
                const result = value.apply(target, args);
                if (result instanceof Promise) {
                    return new Promise((resolve, reject) => {
                        result.then(
                            (data) => {
                                if (status(component) !== "destroyed") {
                                    resolve(data);
                                }
                            },
                            (error) => {
                                if (status(component) !== "destroyed") {
                                    reject(error);
                                }
                            }
                        );
                    });
                }
                return result;
            };
        },
    });
}
