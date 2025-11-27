import { moduleId, MODULE_NAMESPACE, SETTINGS, SETTINGS_DATA, SETTINGS_SYSTEM } from './constants';
import { ModuleLogger } from "./utils/logger";
import { FoundryRestApi } from "./types";
import { initializeWebSocket } from "./network/webSocketEndpoints";
import { Popup_SETTING_INFO } from "./ui/menu";


foundry.helpers.Hooks.once('init', () => {
    console.log(`Initializing ${moduleId}`);

    for (const config of Object.values(SETTINGS_DATA)) {
        // config: foundry.types.SettingConfig
        game.settings.register(MODULE_NAMESPACE, config.key, config);
    }

    game.settings.registerMenu(MODULE_NAMESPACE, "clientInformation", {
        name: "Client Information",
        label: "Client Information",      // The text label used in the button
        hint: "Configure client information in this submenu.",
        icon: "fa-solid fa-bars",               // A Font Awesome icon used in the submenu button
        type: Popup_SETTING_INFO as typeof foundry.applications.api.ApplicationV2,   // DialogV2 extends ApplicationV2 but has a narrower ctor type; cast for registerMenu typing
        restricted: true                   // Restrict this submenu to gamemaster only?
    });

    // Create and expose module API
    const module = game.modules.get(moduleId) as FoundryRestApi;
    module.api = {
        getWebSocketManager: () => {
            if (!module.socketManager) {
                ModuleLogger.warn(`WebSocketManager requested but not initialized`);
                return null;
            }
            return module.socketManager;
        },
        getByUuid: async (uuid: string) => {
            try {
                return await foundry.utils.fromUuid(uuid);
            } catch (error) {
                ModuleLogger.error(`Error getting entity by UUID:`, error);
                return null;
            }
        }
    };

});

foundry.helpers.Hooks.once("ready", () => {
    setTimeout(() => {
        initializeWebSocket();
    }, 1000);

    for (const config of Object.values(SETTINGS_SYSTEM)) {
        // config: foundry.types.SettingConfig
        game.settings.register(MODULE_NAMESPACE, config.key, config);
    }
    const module = game.modules.get(moduleId) as FoundryRestApi;
    game.settings.set(MODULE_NAMESPACE, SETTINGS.CLIENT_ID, module.socketManager?.getClientId());
});
