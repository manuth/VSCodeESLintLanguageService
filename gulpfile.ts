import browserify = require("browserify");
import logger = require("fancy-log");
import FileSystem= require("fs-extra");
import { dest, src, TaskFunction, watch } from "gulp";
import filter = require("gulp-filter");
import sourcemaps = require("gulp-sourcemaps");
import terser = require("gulp-terser");
import ts = require("gulp-typescript");
import merge = require("merge-stream");
import minimist = require("minimist");
import { Server, Socket } from "net";
import PromiseQueue = require("promise-queue");
import parseArgsStringToArgv from "string-argv";
import Path = require("upath");
import buffer = require("vinyl-buffer");
import source = require("vinyl-source-stream");
import Watchify = require("watchify");
import { Settings } from "./.gulp/Settings";
import "./.gulp/TaskFunction";
import { TSReporter } from "./.gulp/TSReporter";

/**
 * The port to listen for stop-requrests.
 */
let watchConnectorPort = 4312;

/**
 * The message that is printed when starting the compilation in watch mode.
 */
let watchStartMessage = "Starting compilation in watch mode...";

/**
 * The message that is printed when starting an incremental compilation.
 */
let incrementalMessage = "File change detected. Starting incremental compilation...";

/**
 * Generates the message that is printed after finishing a compilation in watch mode.
 *
 * @param errorCount
 * The number of errors which occurred.
 */
let watchFinishMessage = (errorCount: number) =>
{
    return `Found ${errorCount} errors. Watching for file changes.`;
};

/**
 * The arguments passed by the user.
 */
let options = ParseArgs(process.argv.slice(2));

/**
 * Parses the specified arguments.
 *
 * @param args
 * The arguments to parse.
 */
function ParseArgs(args: string[])
{
    return minimist(
        args,
        {
            string: [
                "target"
            ],
            alias: {
                target: "t"
            },
            default: {
                target: "Debug"
            }
        });
}

/**
 * The settings for building the project.
 */
let settings = new Settings(options["target"]);

/**
 * Builds the project.
 */
export async function Build(): Promise<NodeJS.ReadWriteStream>
{
    return settings.Debug ? Debug() : Release();
}

/**
 * Builds the project in watched mode.
 */
export let Watch: TaskFunction = (done) =>
{
    settings.Watch = true;
    Build();

    let server = new Server(
        (socket) =>
        {
            socket.on(
                "data",
                (data) =>
                {
                    let args = parseArgsStringToArgv(data.toString());
                    socket.destroy();

                    if (args[0] === "stop")
                    {
                        let options = ParseArgs(args.slice(1));

                        if (options["target"] === settings.Target)
                        {
                            server.close();
                            done();
                            process.exit();
                        }
                    }
                });
        });

    server.listen(watchConnectorPort);
};

/**
 * Executes the compilation for the Debug-target.
 */
function Debug()
{
    let project = ts.createProject(settings.ExtensionPath("tsconfig.json"));

    /**
     * Compiles a Debug-build.
     */
    let builder = () =>
    {
        let reporter = new TSReporter(settings, watchFinishMessage);

        return src(settings.SourcePath("**", "*.ts")).pipe(
            sourcemaps.init()
        ).pipe(
            project(reporter)
        ).pipe(
            (sourcemaps as any).mapSources(
                (sourcePath: string) =>
                {
                    let sourceFile = Path.resolve(settings.SourcePath(), sourcePath);
                    let baseDir = settings.DestinationPath(Path.relative(settings.SourcePath(), Path.dirname(sourceFile)));
                    return Path.relative(baseDir, sourceFile);
                }) as NodeJS.ReadWriteStream
        ).pipe(
            sourcemaps.write(".")
        ).pipe(
            filter(["**", "!**/*.ts.map"])
        ).pipe(
            dest(settings.DestinationPath())
        );
    };

    if (settings.Watch)
    {
        logger.info(watchStartMessage);

        watch(
            settings.SourcePath("**", "*.ts"),
            function Build()
            {
                logger.info(incrementalMessage);
                return builder();
            });
    }

    return builder();
}

/**
 * Executes the compilation for the Release-target.
 */
async function Release()
{
    let streams: Array<Promise<NodeJS.ReadWriteStream>> = [];
    let queue = new PromiseQueue();

    if (settings.Watch)
    {
        logger.info(watchStartMessage);
    }

    let entries = [
        "index.ts"
    ];

    let optionBase: browserify.Options = {
        ...Watchify.args,
        node: true,
        ignoreMissing: true
    };

    {
        let errorMessages: string[] = [];

        for (let file of entries)
        {
            let bundler = browserify(
                {
                    ...optionBase,
                    basedir: Path.normalize(settings.DestinationPath(Path.dirname(file))),
                    entries: [
                        Path.normalize(settings.SourcePath(file))
                    ],
                    standalone: Path.join(Path.dirname(file), Path.parse(file).name)
                });

            if (settings.Watch)
            {
                bundler = Watchify(bundler);
            }

            bundler.plugin(
                require("tsify"),
                {
                    project: settings.ExtensionPath("tsconfig.json")
                }
            ).external(
                [
                    "mocha",
                    "vscode"
                ]);

            let bundle = async () =>
            {
                return new Promise<NodeJS.ReadWriteStream>(
                    (resolve) =>
                    {
                        let stream = bundler.bundle().on(
                            "error",
                            (error) =>
                            {
                                let message: string = error.message;

                                if (!errorMessages.includes(message))
                                {
                                    errorMessages.push(message);
                                    logger.error(message);
                                }
                            }
                        ).pipe(
                            source(Path.changeExt(file, "js"))
                        ).pipe(
                            buffer()
                        ).pipe(
                            terser()
                        ).pipe(
                            dest(settings.DestinationPath())
                        );

                        stream.on(
                            "end",
                            () =>
                            {
                                if (settings.Watch && ((queue.getQueueLength() + queue.getPendingLength()) === 1))
                                {
                                    logger.info(watchFinishMessage(errorMessages.length));
                                }

                                errorMessages.splice(0, errorMessages.length);
                                resolve(stream);
                            });
                    });
            };

            if (settings.Watch)
            {
                bundler.on(
                    "update",
                    () =>
                    {
                        if ((queue.getQueueLength() + queue.getPendingLength()) === 0)
                        {
                            logger.info(incrementalMessage);
                        }

                        queue.add(
                            async () =>
                            {
                                return bundle();
                            });
                    });
            }

            let build = () => queue.add(bundle);
            build.displayName = Build.displayName;
            build.description = Build.description;
            streams.push(build());
        }
    }

    return merge(await Promise.all(streams));
}

/**
 * Cleans all builds.
 */
export async function Clean()
{
    await FileSystem.remove(settings.DestinationPath());
}

/**
 * Stops a watch-task.
 */
export async function Stop()
{
    try
    {
        await new Promise(
            (resolve, reject) =>
            {
                let client = new Socket();

                client.connect(
                    watchConnectorPort,
                    "localhost",
                    async () =>
                    {
                        client.write(`stop -t ${settings.Target}`);
                    });

                client.on("close", resolve);
                client.on("error", reject);
            });
    }
    catch
    {
        logger.info("The specified task is not running.");
    }
}

Build.description = "Builds the project";
Watch.description = "Builds the project in watched mode.";
Clean.description = "Cleans all builds";
Stop.description = "Stops a watch-task";
export default Build;
