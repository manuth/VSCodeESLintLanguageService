/**
 * Represents the API of the TypeScript-extension.
 */
export interface IApiV0
{
    /**
     * Configures a plugin.
     *
     * @param pluginId
     * The id of the plugin to configure.
     *
     * @param configuration
     * The configuration to apply.
     */
    configurePlugin(pluginId: string, configuration: Record<string, unknown>): void;
}
