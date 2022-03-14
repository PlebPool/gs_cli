#!/usr/bin/env node

import childProcess from "child_process"
import inquirer from "inquirer"
import figlet from "figlet"
import gradient from "gradient-string"
import fs from "fs"

async function welcome() {
    let author = " https://github.com/PlebPool/gs_cli.git"
    let msg = "GS_CLI.js"
    let underline = " (Git Session Command Line Interface)"
    let separator = "-----------------------------------------|"
    return figlet(msg, (err, data) => {
        if(err) {
            console.log(err.message);
        } else {
            console.log(gradient.pastel.multiline(separator))
            console.log(gradient.pastel.multiline(author))
            console.log(gradient.pastel.multiline(data))
            console.log(gradient.pastel.multiline(underline))
            console.log(gradient.pastel.multiline(separator))
            globalQuestion1();
        }
    })
}

async function globalQuestion1() {
    const commands = [
        "SELECT STARTING FOLDER"
    ]
    await inquirer.prompt({
        name: "menu",
        type: "list",
        message: "SELECT ONE:",
        choices: commands
    })
    .then((answers) => {
        if(answers["menu"] === commands[0]) {
            selectFolder(process.cwd());
        }
    })
    .catch((err) => {
        console.log(err)
    })
}

async function selectFolder(folderPath) {
    let folderNames = await getFolderContentNames(folderPath)
    let initial = await inquirer.prompt({
        name: "folderPath",
        type: "list",
        message: "Pick a folder, any folder:",
        choices: folderNames
    })
    let path = initial["folderPath"]
    if(!path.endsWith("..") && path.endsWith(".")) {
        await acceptWhereYouAre(folderPath)
    } else {
        await selectFolder(folderPath + "/" + path)
    }
}

async function getFolderContentNames(path) {
    let folderNames = fs.readdirSync(path, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
    folderNames.unshift("..")
    folderNames.unshift(".")
    return folderNames
}

async function acceptWhereYouAre(folderPath) {
    let answers = await inquirer.prompt({
        name: "msg",
        type: "input",
        message: "Commit message ('gs_cli - ' will be prefixed):",
    })
    childProcess.spawnSync("git", ["add", "."], {cwd: folderPath})
    childProcess.spawnSync("git", ["commit", "-m", `gs_cli - ${answers["msg"]}`], {cwd: folderPath})
    let another = await inquirer.prompt({
        name: "another",
        type: "confirm",
        message: "Another commit?"
    })
    if(another["another"]) {
        await acceptWhereYouAre(folderPath)
    } else {
        let wantPush = await inquirer.prompt({
            name: "wantPush",
            type: "confirm",
            message: "Do you want to push?"
        })
        if(wantPush["wantPush"]) {
            childProcess.spawnSync("git", ["push"], {cwd: folderPath})
        }
        process.exit();
    }
}

await welcome();