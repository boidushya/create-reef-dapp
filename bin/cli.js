#!/usr/bin/env node

import chalk from "chalk";
import prompts from "prompts";
import path from "path";
import os from "os";
import fse from "fs-extra";
import _progress from "cli-progress";
import { execSync } from "child_process";

const cleanUpFiles = (folder) => {
  console.log(chalk.yellow("Deleting template files...\n"));

  fse.rmSync(path.join(folder), {
    recursive: true,
    force: true,
  });

  console.log("Project cleaned up ✅ ");
};

console.log(
  chalk.magenta(`
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@                   %@@@@@@@@
@@@@@@@                            @@@@@
@@@@             /@@@@@@@            @@@
@@           @@@@@@@@@@@@@@@@         @@
@          @@@@@@@    @@@@@@@@        @@
@        .@@@@@@       @@@@@@         @@
@@/    @@@@@@@        @@@@@@         /@@
@@@@@@@@@@@@         @@@@@          @@@@
@@@@@@@@@@@         @@            @@@@@@
@@@@@@@@@@                     %@@@@@@@@
@@@@@@@@                   @@@@@@@@@@@@@
@@@@@@@               @@@@@@@@@@@@@@@@@@
@@@@@         &        @@@@@@@@@@@@@@   
@@@@          @@        @@@@@@@@@@      
@@@          @@@@          /            
@@          @@@@@@@                  @@@
@@        @@@@@@@@@@@            %@@@@@@
`)
);

console.log("\n");
console.log("🪸 Welcome to the create-reef-dapp wizard 🪸");
console.log("\n");

// if (process.argv[2]) {
//   // TODO directly create the dapp
// }

let projectPath = "";
let context = {};

projectPath = "";
// Checks if project name is provided
if (typeof projectPath === "string") {
  projectPath = projectPath.trim();
}
while (!projectPath) {
  projectPath = await prompts({
    type: "text",
    name: "projectPath",
    message: "Please, insert a project name \n",
    initial: "my-reef-dapp",
  }).then((data) => data.projectPath);
}
//Reformat project's name
projectPath = projectPath.trim().replace(/[\W_]+/g, "-");
context.resolvedProjectPath = path.resolve(projectPath);
let dirExists = fse.existsSync(context.resolvedProjectPath);

let i = 1;

// Check if project exists
while (dirExists) {
  projectPath = await prompts({
    type: "text",
    name: "projectPath",
    message:
      "A directory with this name already exists, please use a different name \n",
    initial: `my-reef-dapp-${i}`,
  }).then((data) => data.projectPath.trim().replace(/[\W_]+/g, "-"));

  context.resolvedProjectPath = path.resolve(projectPath);

  dirExists = fse.existsSync(context.resolvedProjectPath);

  i += 1;
}
context.projectName = path.basename(context.resolvedProjectPath);

const finalPrompt = await prompts({
  type: "confirm",
  name: "value",
  message: `Are you sure you want to create your reef dapp in ${chalk.magenta(
    projectPath
  )} \n`,
  initial: true,
}).then((data) => data.value);

if (finalPrompt) {
  // copy template from core folder to project folder
  console.log(chalk.bold(chalk.magenta("🚀 Creating your Reef Dapp 🚀")));
  const b1 = new _progress.Bar({}, _progress.Presets.shades_classic);
  b1.start(40, 0);
  let value = 0;

  fse.mkdtemp(path.join(os.tmpdir(), "reef-"), (err, folder) => {
    if (err) throw err;
    execSync(
      `git clone --depth 1 ${"https://github.com/boidushya/create-reef-dapp"} ${folder}`
    );
    fse.copySync(path.join(folder, "core"), context.resolvedProjectPath);
    cleanUpFiles(folder);
  });

  const timer = setInterval(function () {
    value++;
    b1.update(value);
    if (value >= b1.getTotal()) {
      clearInterval(timer);
      b1.stop();
      console.log(
        chalk.bold(chalk.magenta("🎉 Your Reef Dapp is ready 🎉\n\n")),
        "To start your dapp, run the following commands:\n\n",
        chalk.bold("\tcd " + projectPath),
        chalk.bold("\n\tyarn install"),
        chalk.bold("\n\tyarn start")
      );
    }
  }, 20);
} else {
  process.exit(0);
}
