//@corebuild staticEval

var fs = require("fs");
const fse = require('fs-extra');
var pth = require("path");
var marked = require("marked");
const { deleteSync } = require("node-fs-extra");
var corebuildTag = "<." + ">";
var OptiPng = require('optipng');
var minify = import("minify");
const GITHUB_PAGES_PATH = "https://codelikecraze.github.io/neon/";

// delete build folder

if (fs.existsSync(pth.join(__dirname, "build"))) {
    fs.rmSync(pth.join(__dirname, "build"), {
        recursive: true,
        force: true
    });
}

// copy all files into build folder

async function build(path, dest) {
    console.log("building " + path);

    if (minify instanceof Promise) {
        minify = (await minify).minify;
    }

    // detect if path is a directory

    if (fs.statSync(path).isDirectory()) {
        fs.mkdirSync(dest);
        var children = fs.readdirSync(path);
        for (var i in children) {
            var child = children[i];
            var bannedDirectories = ["build", "node_modules"];
            if (bannedDirectories.includes(child) || child.startsWith('.')) {
                continue;
            }
            await build(pth.join(path, child), pth.join(dest, child));
        }
    } else {
        var output = "";
        var fileContent = fs.readFileSync(path, "utf-8");

        var configFlag = "@corebuild";
        var staticEval = configFlag + " staticEval";
        var markdown = configFlag + " markdown";

        var useStaticEval = fileContent.includes(staticEval);
        var useMarkdown = fileContent.includes(markdown);

        if (useStaticEval) {
            fileContent = fileContent.split(staticEval).join("");
            var sections = fileContent.split(corebuildTag);

            for (var i in sections) {
                if (i % 2 == 0) {
                    output += sections[i];
                } else {
                    var content = eval(sections[i]);
                    console.log("compiling corebuild section " + sections[i] + " :: " + content);
                    output += content; /* corebuild will turn this <.> 1 + 1 <.> into 2*/
                }
            }

            fileContent = output;
        }

        if (useMarkdown) {
            fileContent = fileContent.split(markdown).join("");
            fileContent = `<!DOCTYPE html><link rel="stylesheet" href="style.css">` + await marked.parse(fileContent);
            dest = dest.split("md").join("html");
        }

        if (path.includes("png")) {
            console.log("optimizing " + path);
            var srcStream = fs.createReadStream(path);
            var destStream = fs.createWriteStream(dest);
            var imageOptimizer = new OptiPng(['-o7']);
            imageOptimizer.on('end', () => {
                var optimized = fs.readFileSync(dest);
                console.log(`Optimized ${path} and compressed to ${Math.round(optimized.length / fileContent.length * 100)}% of the size.`);
            });
            srcStream.pipe(imageOptimizer).pipe(destStream);
        } else {
            await fs.promises.writeFile(dest, fileContent);
            if ((path.includes("html") || path.includes("js") || path.includes("css")) && !path.includes("json")) {
                if (!!fileContent) {
                    await fs.promises.writeFile(dest, await minify(dest));
                }
            }
        }
    }
}

build(__dirname, pth.join(__dirname, "build"));
