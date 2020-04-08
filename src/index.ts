import { ExtensionContext } from "vscode";
import { Extension } from "./Extension";

/**
 * The extension.
 */
let extension = new Extension();

/**
 * Activates the extension.
 */
export let activate = (context: ExtensionContext) => extension.Activate(context);

/**
 * Deactivates the extension.
 */
export let deactivate = () =>  extension.Dispose();
