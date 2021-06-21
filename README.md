# VSCodeESLintLanguageService
A VSCode-Extension that provides ESLint support using `@manuth/typescript-eslint-plugin`

## Requirements
In order to use this extension you need to have `eslint` installed either in your workspace or globally.

## Usage
Configure this extension according to the [Configuration](#configuration)-section as desired. You might want to override your extension-configuration for certain typescript-project. You can do so by editing your project's `tsconfig.json`-file and adding your plugin-settings:

***tsconfig.json***
```js
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@manuth/typescript-eslint-plugin",
        "ignoreJavaScript": true,
        "configFile": "custom.eslintrc.js"
      }
    ]
  }
}
```

## Configuration
  - `eslint-service.ignoreJavaScript`:  
    Allows you to ignore javascript-files. (default: `false`)
  - `eslint-service.ignoreTypeScript`:  
    Allows you to ignore typescript-files. (default: `false`)
  - `eslint-service.allowInlineConfig`:  
    Controls whether eslint-comments such as `// eslint-disable-next-line` are processed. (default: `true`)
  - `eslint-service.reportUnusedDisableDirectives`:  
    Allows you to specify whether useless `eslint-disable` comments should be reported. (default: `true`)
  - `eslint-service.useEslintrc`:  
    Controls whether the eslint-configuration should be loaded from `.eslintrc.*`-files. (default: `true`)
  - `eslint-service.configFile`:  
    Allows you to load the `eslintrc`-configuration from a custom file. (default: `undefined`)
  - `eslint-service.alwaysShowRuleFailuresAsWarnings`:  
    Controls whether all failures should be reported as warnings no matter whether they are actual errors or warnings. (default: `false`)
  - `eslint-service.suppressWhileTypeErrorsPresent`:  
    Controls whether eslint-reports should be suppressed while there are other errors present. (default: `false`)
  - `eslint-service.suppressDeprecationWarnings`:  
    Allows you to suppress reports about the usage of deprecated rules. (default: `false`)
  * `eslint-service.suppressConfigNotFoundError`:  
    By setting this option to `true` you can enable errors if no eslint-configuration could be found (default: `true`)
  - `eslint-service.packageManager`:  
    Specifies the package-manager which is used for loading global modules. (default: `npm`)
  - `eslint-service.logLevel`:  
    Controls the level of logging. (default: `none`)
