import { ExtensionContext } from "vscode";
import { Extension } from "./Extension";

/**
 * The extension.
 */
let extension = new Extension();

/**
 * Activates the extension.
 *
 * @param context
 * The extension-context.
 */
export let activate = (context: ExtensionContext): Promise<void> => extension.Activate(context);

/**
 * Deactivates the extension.
 */
export let deactivate = (): void => extension.Dispose();
