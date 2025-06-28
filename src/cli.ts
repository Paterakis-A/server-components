import { commandBuilder } from "./commands/builder";

commandBuilder
  .demandCommand(1, "You need to specify a command (e.g., run).")
  .strict()
  //   .help()
  .alias("h", "help")
  .alias("v", "version")
  .parse();
