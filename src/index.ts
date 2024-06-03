import { program } from "commander";
import { concatFiles } from "./concatenate";

program
  .action(concatFiles)
  .name("concatenate")
  .description("Concatenate files in a directory")
  .requiredOption("-d, --dir <dir>", "a directory")
  .option("-t, --type <type>", "a file type", undefined);

program.parse();
