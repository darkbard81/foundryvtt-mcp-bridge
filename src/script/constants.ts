import { id } from '../module.json';

export const moduleId = id;

export const MODULE_NAMESPACE: string = id;

const FormInput_API_KEY: foundry.applications.fields.CustomFormInput = (field: foundry.data.fields.DataField, config: foundry.data.types.FormInputConfig) => {
    const group = document.createElement("div");
    group.className = "form-group";

    const id = config.id ?? config.name; // for/id 매칭
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = "API Key";

    const fields = document.createElement("div");
    fields.className = "form-fields";
    const input = document.createElement("input");
    input.type = "password";
    input.id = id;
    input.name = config.name;
    input.value = config.value as string ?? "";
    input.autocomplete = "one-time-code";
    fields.append(input);

    group.append(label, fields);
    return group; // HTMLElement 반환
};

export const SETTINGS = {
    //Websoket Setting
    WS_RELAY_URL: 'wsRelayUrl',
    CUSTOM_NAME: "customName",
    LOG_LEVEL: "logLevel",
    PING_INTERVAL: "pingInterval",
    RECONNECT_MAX_ATTEMPTS: "reconnectMaxAttempts",
    RECONNECT_BASE_DELAY: "reconnectBaseDelay",
    //Client Info
    API_KEY: "apiKey",
    CLIENT_ID: 'clientId',
    WORLD_ID: 'worldId',
    WORLD_TITLE: 'worldTitle',
    FOUNDRY_VERSION: 'foundryVersion',
    SYSTEM_ID: 'systemId',
    SYSTEM_TITLE: 'systemTitle',
    SYSTEM_VERSION: 'systemVersion'
};

export const SETTINGS_DATA: Record<string, foundry.types.SettingConfig> = {
    [SETTINGS.WS_RELAY_URL]: {
        key: SETTINGS.WS_RELAY_URL,
        namespace: MODULE_NAMESPACE,
        name: "WebSocket Relay URL",
        hint: "The URL of the WebSocket relay server.",
        scope: "world",     // This specifies a world-level setting         
        config: true,      // This specifies that the setting appears in the configuration view
        type: new foundry.data.fields.StringField(),
        default: "ws://localhost:8080"
    },

    [SETTINGS.CUSTOM_NAME]: {
        key: SETTINGS.CUSTOM_NAME,
        namespace: MODULE_NAMESPACE,
        name: "Custom Client Name",
        hint: "A custom name to identify this client (optional)",
        scope: "world",
        config: true,
        type: new foundry.data.fields.StringField(),
        default: ""
    },

    [SETTINGS.LOG_LEVEL]: {
        key: SETTINGS.LOG_LEVEL,
        namespace: MODULE_NAMESPACE,
        name: "Log Level",
        hint: "Set the level of detail for module logging",
        scope: "world",
        config: true,
        type: String,
        choices: {
            0: "debug",
            1: "info",
            2: "warn",
            3: "error"
        },
        default: 2
    },

    [SETTINGS.PING_INTERVAL]: {
        key: SETTINGS.PING_INTERVAL,
        namespace: MODULE_NAMESPACE,
        name: "Ping Interval (seconds)",
        hint: "How often (in seconds) the module sends a ping to the relay server to keep the connection alive.",
        scope: "world",
        config: true,
        type: Number,
        default: 30,
        range: {
            min: 5,
            max: 600,
            step: 1
        }
    },

    [SETTINGS.RECONNECT_MAX_ATTEMPTS]: {
        key: SETTINGS.RECONNECT_MAX_ATTEMPTS,
        namespace: MODULE_NAMESPACE,
        name: "Max Reconnect Attempts",
        hint: "Maximum number of times the module will try to reconnect after losing connection.",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField(),
        default: 20
    },

    [SETTINGS.RECONNECT_BASE_DELAY]: {
        key: SETTINGS.RECONNECT_BASE_DELAY,
        namespace: MODULE_NAMESPACE,
        name: "Reconnect Base Delay (ms)",
        hint: "Initial delay (in milliseconds) before the first reconnect attempt. Subsequent attempts use exponential backoff.",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField(),
        default: 1000
    }
};

export const SETTINGS_SYSTEM: Record<string, foundry.types.SettingConfig> = {

    [SETTINGS.API_KEY]: {
        key: SETTINGS.API_KEY,
        namespace: MODULE_NAMESPACE,
        name: "API Key",
        hint: "API Key for authentication with the relay server",
        scope: "world",
        config: true,
        type: new foundry.data.fields.StringField(),
        default: CONST.PASSWORD_SAFE_STRING,
        input: FormInput_API_KEY
    },

    [SETTINGS.CLIENT_ID]: {
        key: SETTINGS.CLIENT_ID,
        namespace: MODULE_NAMESPACE,
        name: "Client ID",
        hint: "UniqueID for connect WebSocket relay server",
        scope: "world",     // This specifies a world-level setting         
        config: false,      // This specifies that the setting appears in the configuration view
        type: new foundry.data.fields.StringField(),
        default: ""
    },
    [SETTINGS.WORLD_ID]: {
        key: SETTINGS.WORLD_ID,
        namespace: MODULE_NAMESPACE,
        name: "World ID",
        hint: "Foundry world identifier",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField(),
        default: game.world?._source?.id ?? ""
    },
    [SETTINGS.WORLD_TITLE]: {
        key: SETTINGS.WORLD_TITLE,
        namespace: MODULE_NAMESPACE,
        name: "World Title",
        hint: "Foundry world title",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField(),
        default: game.world?._source?.title ?? ""
    },
    [SETTINGS.FOUNDRY_VERSION]: {
        key: SETTINGS.FOUNDRY_VERSION,
        namespace: MODULE_NAMESPACE,
        name: "Foundry Version",
        hint: "Running Foundry VTT version",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField(),
        default: game?.version ?? ""
    },
    [SETTINGS.SYSTEM_ID]: {
        key: SETTINGS.SYSTEM_ID,
        namespace: MODULE_NAMESPACE,
        name: "System ID",
        hint: "Game system identifier",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField(),
        default: game.system?._source?.id ?? ""
    },
    [SETTINGS.SYSTEM_TITLE]: {
        key: SETTINGS.SYSTEM_TITLE,
        namespace: MODULE_NAMESPACE,
        name: "System Title",
        hint: "Game system title",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField(),
        default: game.system?._source?.title ?? ""
    },
    [SETTINGS.SYSTEM_VERSION]: {
        key: SETTINGS.SYSTEM_VERSION,
        namespace: MODULE_NAMESPACE,
        name: "System Version",
        hint: "Game system version",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField(),
        default: game.system?._source?.version ?? ""
    }
}
