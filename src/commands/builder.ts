import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { startApiServer } from "./start";
import { exit } from "process";
import { createApiServer } from "./create";

export const commandBuilder = yargs(hideBin(process.argv))
  .command(
    "run",
    "start api server",
    (yargs) => {
      return yargs
        .option("force", {
          alias: "f", // Allow using -f as a shortcut
          type: "boolean", // Expect a boolean value (true if flag is present, false otherwise)
          description: "Force the operation if needed", // Description for help message
          default: false, // Default value if the flag isn't provided
        })
        .option("name", {
          // Example of another option
          alias: "n",
          type: "string",
          description: "Specify a name",
          default: "app", // Default folder name
        });
    },
    (argv) => {
      console.log(argv);

      try {
        // startApiServer(["a"]);
      } catch (error: any) {
        console.log(error);
        exit(0);
      }
    },
  )
  .command(
    "create",
    "create api server",
    (yargs) => {
      return yargs
        .option("force", {
          alias: "f", // Allow using -f as a shortcut
          type: "boolean", // Expect a boolean value (true if flag is present, false otherwise)
          description: "Force the operation if needed", // Description for help message
          default: false, // Default value if the flag isn't provided
        })
        .option("name", {
          // Example of another option
          alias: "n",
          type: "string",
          description: "Specify a name",
          default: "app", // Default folder name
        });
    },
    (argv) => {
      try {
        createApiServer(argv);
      } catch (error) {
        console.log(error);
      }
    },
  );
