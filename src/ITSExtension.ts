import { IApiV0 } from "./IApiV0";

/**
 * Represents the typescript-extension.
 */
export interface ITSExtension
{
    /**
     * Gets an API from the plugin.
     *
     * @param version
     * The version of the api to get.
     */
    getAPI?(version: number): IApiV0;
}
