import { ITSConfiguration } from "typescript-eslint-plugin/lib/Settings/ITSConfiguration";
import { ExtensionContext, extensions, workspace } from "vscode";
import { IApiV0 } from "./IApiV0";

/**
 * Represents the extension.
 */
export class Extension
{
    /**
     * The extension-id of the `typescript` extension.
     */
    private static typeScriptExtensionId = "vscode.typescript-language-features";

    /**
     * The id of the plugin to add.
     */
    private static pluginId = "typescript-eslint-plugin";

    /**
     * The name of the configuration-section.
     */
    private static configSection = "eslint-service";

    /**
     * The context of the extension.
     */
    private context: ExtensionContext = null;

    /**
     * Initializes a new instance of the `Extension`-class.
     */
    public constructor()
    { }

    /**
     * Gets context of the of the extension.
     */
    public get Context()
    {
        return this.context;
    }

    /**
     * Activates the extension.
     *
     * @param context
     * A collection of utilities private to an extension.
     */
    public async Activate(context: ExtensionContext)
    {
        this.context = context;
        let typeScriptExtension = extensions.getExtension(Extension.typeScriptExtensionId);

        if (typeScriptExtension)
        {
            await typeScriptExtension.activate();

            if (typeScriptExtension.exports?.getAPI)
            {
                let api = typeScriptExtension.exports.getAPI(0);

                workspace.onDidChangeConfiguration(
                    (event) =>
                    {
                        if (event.affectsConfiguration(Extension.configSection))
                        {
                            this.UpdateConfig(api);
                        }
                    });

                this.UpdateConfig(api);
            }
        }
    }

    /**
     * Disposes the extension.
     */
    public Dispose(): void
    { }

    /**
     * Updates the configuration of the plugin.
     */
    protected UpdateConfig(api: IApiV0)
    {
        let workspaceConfig = workspace.getConfiguration();
        let config = workspaceConfig.get(Extension.configSection);

        if (typeof config === "object")
        {
            let extensionConfig = workspace.getConfiguration(Extension.configSection);
            let result: { -readonly [K in keyof ITSConfiguration]: ITSConfiguration[K] } = {};

            for (let key in config)
            {
                let inspectedConfig = extensionConfig.inspect(key);

                if (
                    (typeof inspectedConfig.globalValue !== "undefined") ||
                    (typeof inspectedConfig.workspaceValue !== "undefined") ||
                    (typeof inspectedConfig.workspaceFolderValue !== "undefined"))
                {
                    result[key as keyof ITSConfiguration] = extensionConfig.get(key);
                }
            }

            api.configurePlugin(Extension.pluginId, result);
        }
    }
}
