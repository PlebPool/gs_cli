#!/usr/bin/env node

import childProcess from "child_process"
import chalkAnimation from "chalk-animation"
import chalk from "chalk"
import inquirer from "inquirer"
import figlet from "figlet"
import nanospinner from "nanospinner"
import gradient from "gradient-string"
import fs from "fs"

async function welcome() {
    let msg = "GS_CLI.js"
    let underline = " (Git Session Command Line Interface)"
    let separator = "---------------------------------------"
    return figlet(msg, (err, data) => {
        if(err) {
            console.log(err.message);
        } else {
            console.log(gradient.pastel.multiline(data))
            console.log(gradient.pastel.multiline(underline))
            console.log(gradient.pastel.multiline(separator))
            globalQuestion1();
        }
    })
}

async function globalQuestion1() {
    const commands = [
        "SELECT REPOSITORY IN FOLDER"
    ]
    await inquirer.prompt({
        name: "menu",
        type: "list",
        message: "SELECT ONE:",
        choices: commands
    })
    .then((answers) => {
        if(answers["menu"] === "SELECT REPOSITORY IN FOLDER") {
            selectRepositoryInFolder();
        }
    })
    .catch((err) => {
        console.log(err)
    })
}

async function selectRepositoryInFolder() {
    let folderNames = fs.readdirSync(process.cwd(), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory)
        .map(dirent => dirent.name);

    for(let i = 0; i < folderNames.length; i++) {
        console.log(folderNames[i])
    }
    let initial = await inquirer.prompt({
        name: "folderPath",
        type: "input",
        message: `Type path of folder: ${process.cwd()}`
    })

    let path = process.cwd()
    if(initial["folderPath"]) {
        path = initial["folderPath"]
        folderNames = fs.readdirSync(path, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory)
            .map(dirent => dirent.name);
    }

    await walkInto(path, folderNames);
}

async function walkInto(folderPath, folderNames) {
    let done = await inquirer.prompt({
        name: "done",
        type: "confirm",
        message: "Are you where you want to be?"
    })
    if(done["done"]) {
        await acceptWhereYouAre(folderPath)
    } else {
        let answers2 = await inquirer.prompt({
            name: "pickOne",
            type: "list",
            message: "Pick One:",
            choices: folderNames
        })
        let folderNames2 = fs.readdirSync(folderPath+"\\"+answers2["pickOne"], { withFileTypes: true })
                .filter(dirent => dirent.isDirectory)
                .map(dirent => dirent.name);
        await walkInto(folderPath + "\\" + answers2["pickOne"], folderNames2)
    }
}

async function acceptWhereYouAre(folderPath) {
    let answers = await inquirer.prompt({
        name: "msg",
        type: "input",
        message: "Commit message ('gs_cli - ' will be prefixed):",
    })
    childProcess.spawn("git", ["add", "."], {cwd: folderPath})
    childProcess.spawn("git", ["commit", "-m", `gs_cli - ${answers["msg"]}`], {cwd: folderPath})
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
            childProcess.spawn("git push")
        }
        process.exit();
    }
}

await welcome();