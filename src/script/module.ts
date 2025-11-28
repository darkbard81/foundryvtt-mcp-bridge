import { moduleId, MODULE_NAMESPACE, SETTINGS, SETTINGS_DATA, SETTINGS_SYSTEM } from './constants';
import { ModuleLogger } from "./utils/logger";
import { Popup_SETTING_INFO } from "./ui/menu";
import { FoundryRestApi } from "./types";
import { initializeWebSocket } from "./network/webSocketEndpoints";


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

        const module = game.modules.get(moduleId) as FoundryRestApi;
        const webSocketManager = module.api.getWebSocketManager();

        for (const config of Object.values(SETTINGS_SYSTEM)) {
            // config: foundry.types.SettingConfig
            if (config.default === "") {
                switch (config.key) {
                    case SETTINGS.CLIENT_ID:
                        config.default = webSocketManager?.getClientId();
                        break;
                    case SETTINGS.WORLD_ID:
                        config.default = game.world?._source?.id;
                        break;
                    case SETTINGS.WORLD_TITLE:
                        config.default = game.world?._source?.title;
                        break;
                    case SETTINGS.FOUNDRY_VERSION:
                        config.default = game.version;
                        break;
                    case SETTINGS.SYSTEM_ID:
                        config.default = game.system?._source?.id;
                        break;
                    case SETTINGS.SYSTEM_TITLE:
                        config.default = game.system?._source?.title;
                        break;
                    case SETTINGS.SYSTEM_VERSION:
                        config.default = game.system?._source?.version;
                        break;
                    default:
                        break;
                }
            };
            game.settings.register(MODULE_NAMESPACE, config.key, config);
        }
    }, 1000);
});
