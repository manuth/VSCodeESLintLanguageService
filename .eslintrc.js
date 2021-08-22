const { join } = require("path");
// eslint-disable-next-line node/no-unpublished-require
const ESLintPresets = require("@manuth/eslint-plugin-typescript");

module.exports = {
    extends: [
        `plugin:${ESLintPresets.PluginName}/${ESLintPresets.PresetName.RecommendedWithTypeChecking}`
    ],
    env: {
        node: true,
        es6: true
    },
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.json"),
            join(__dirname, "tsconfig.eslint.json")
        ]
    }
};
