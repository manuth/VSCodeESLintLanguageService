import logger = require("fancy-log");
import gts = require("gulp-typescript");
import ts = require("typescript");
import { Settings } from "./Settings";

/**
 * Provides the functionality to report messages.
 */
export class TSReporter implements Required<gts.reporter.Reporter>
{
    /**
     * The settings.
     */
    private settings: Settings;

    /**
     * Provides the functionality to generate finish-messages.
     */
    private finishMessageGenerator: (errorCount: number) => string;

    /**
     * Initializes a new instance of the `TSReporter`-class.
     *
     * @param settings
     * The settings to apply.
     *
     * @param finishMessageGenerator
     * A component for generating finish-messages.
     */
    public constructor(settings: Settings, finishMessageGenerator: (errorCount: number) => string)
    {
        this.settings = settings;
        this.finishMessageGenerator = finishMessageGenerator;
    }

    /**
     * Reports an error.
     *
     * @param error
     * The error to report.
     *
     * @param typescript
     * The typesript-installation.
     */
    public error(error: gts.reporter.TypeScriptError, typescript: typeof ts)
    {
        gts.reporter.defaultReporter().error(error, typescript);
    }

    /**
     * Reports results.
     *
     * @param results
     * The results to report.
     */
    public finish(results: gts.reporter.CompilationResult)
    {
        if (this.settings.Watch)
        {
            let errorCount =
                results.transpileErrors +
                results.optionsErrors +
                results.syntaxErrors +
                results.globalErrors +
                results.semanticErrors +
                results.declarationErrors +
                results.emitErrors;

            logger.info(this.finishMessageGenerator(errorCount));

            results.transpileErrors = 0;
            results.optionsErrors = 0;
            results.syntaxErrors = 0;
            results.globalErrors = 0;
            results.semanticErrors = 0;
            results.declarationErrors = 0;
            results.emitErrors = 0;
        }
        else
        {
            gts.reporter.defaultReporter().finish(results);
        }
    }
}
