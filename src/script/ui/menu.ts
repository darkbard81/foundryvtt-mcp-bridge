
import { moduleId, SETTINGS, SETTINGS_DATA, SETTINGS_SYSTEM } from '../constants';
import { ModuleLogger } from '../utils/logger';


export class Popup_SETTING_INFO extends foundry.applications.api.DialogV2 {

    /**
     * @override
     * Applications are constructed by providing an object of configuration options.
     * @param {Partial<Configuration>} [options]    Options used to configure the Application instance
     */
    constructor(options = {}) {
        super(foundry.utils.mergeObject({
            window: { title: "System Infomation" },
            content: "",
            buttons: [{
                action: "ok",
                label: "OK",
                default: true,
                callback: (event: any, button: any, dialog: any) => dialog.close({ submitted: true })
            }]
        }, options));
    }


    /** @override */
    override async _renderHTML(_context: any, _options: any) {
        const htmlContents = document.createElement("section");
        htmlContents.className = "tab scrollable active";

        for (const config of Object.values(SETTINGS_SYSTEM)) {
            // config: foundry.types.SettingConfig
            const group = document.createElement("div");
            group.className = "form-group";

            const fields = document.createElement("div");
            fields.className = "form-fields";
            const input = document.createElement("input");
            input.id = config.namespace && config.key;
            input.name = config.name;
            input.value = game.settings.get(moduleId, config.key);
            input.readOnly = config.key === SETTINGS.API_KEY ? false : true;
            input.type = config.key === SETTINGS.API_KEY ? "password" : "text";
            input.autocomplete = "off";
            fields.append(input);

            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.textContent = input.name;

            input.addEventListener("click", async (event) => {
                event.preventDefault(); // 클릭/포커스/submit 연쇄를 막고
                event.stopPropagation();
                try {
                    await navigator.clipboard.writeText(input.value ?? "");
                    ui.notifications?.info("Copied to clipboard.");
                } catch (err) {
                    ModuleLogger.warn("Clipboard copy failed", err);
                    ui.notifications?.warn("Fail copied to clipboard.");
                }
            });
            group.append(label, fields);
            htmlContents.append(group);
        }
        const form = document.createElement("form");
        form.className = "dialog-form standard-form";
        form.autocomplete = "off";

        const content = document.createElement("div");
        content.className = "dialog-content standard-form";
        content.append(htmlContents);

        const footer = document.createElement("footer");
        footer.className = "form-footer";
        footer.innerHTML = this._renderButtons();

        form.append(content, footer);
        // form.innerHTML = `<div class="dialog-content standard-form">${htmlContents.outerHTML}</div>
        //                   <footer class="form-footer">${this._renderButtons()}</footer>`;
        form.addEventListener("submit", event => this._onSubmit(event.submitter as HTMLButtonElement, event, form));
        return form;
    }

    /** @override */
    override async _onSubmit(target: HTMLButtonElement, event: PointerEvent | SubmitEvent, form?: HTMLFormElement) {
        event.preventDefault(); // Prevent default browser dialog dismiss behavior.
        event.stopPropagation();
        const activeForm = form ?? (event.currentTarget instanceof HTMLFormElement ? event.currentTarget : null);
        if (!activeForm) {
            ModuleLogger.warn("Submit received without a form element");
            return this.close({ submitted: false });
        }

        const formData = new FormData(activeForm);
        const prevApiKey = game.settings.get(moduleId, SETTINGS.API_KEY);
        const nextApiKey = String(formData.get(SETTINGS.API_KEY) ?? "");
        const apiKeyChanged = nextApiKey !== prevApiKey;

        if (apiKeyChanged) {
            await game.settings.set(moduleId, SETTINGS.API_KEY, nextApiKey);
        }
        return this.close({ submitted: true });
    }

    /** @override */
    override async render(options = {}, _options = {}) {
        const normalized = typeof options === "boolean"
            ? Object.assign(_options, { force: options })
            : options ?? {};
        return super.render({ force: true, ...normalized }, _options);
    }
}
