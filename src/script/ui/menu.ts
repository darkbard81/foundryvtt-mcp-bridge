
import { moduleId, MODULE_NAMESPACE, SETTINGS_DATA } from '../constants';
import { ModuleLogger } from '../utils/logger';

export const FormInput_API_KEY: foundry.applications.fields.CustomFormInput = (field: foundry.data.fields.DataField, config: foundry.data.types.FormInputConfig) => {
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
        // this.options.content = 's';
        const htmlContents = document.createElement("div");

        for (const config of Object.values(SETTINGS_DATA)) {
            const group = document.createElement("div");
            group.className = "form-group";

            const fields = document.createElement("div");
            fields.className = "form-fields";
            const input = document.createElement("input");
            input.id = config.namespace && config.key;
            input.name = config.name;
            input.value = game.settings.get(moduleId, config.key) as string;
            input.readOnly = true;
            input.type = config.type === FormInput_API_KEY ? "password" : "text";
            fields.append(input);

            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.textContent = input.name;

            input.addEventListener("pointerdown", async (event) => {
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
        form.innerHTML = `<div class="dialog-content standard-form">${htmlContents.outerHTML}</div>
                          <footer class="form-footer">${this._renderButtons()}</footer>`;
        form.addEventListener("submit", event => this._onSubmit(event.submitter as HTMLButtonElement, event));
        return form;
    }

    /** @override */
    override async _onSubmit(target: HTMLButtonElement, event: PointerEvent | SubmitEvent) {
        event.preventDefault(); // Prevent default browser dialog dismiss behavior.
        event.stopPropagation();
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
