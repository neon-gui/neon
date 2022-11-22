//@corebuild staticEval

var fs = require("fs");
const fse = require('fs-extra');
var pth = require("path");
var marked = require("marked");
const { deleteSync } = require("node-fs-extra");
var corebuildTag = "<." + ">";
const GITHUB_PAGES_PATH = "https://codelikecraze.github.io/neon/";

// delete build folder

if (fs.existsSync(pth.join(__dirname,"build"))) {
    fs.rmdirSync(pth.join(__dirname,"build"),{
        recursive:true,
        force:true
    });    
}

// copy all files into build folder

async function build(path,dest) {
    console.log("building " + path);

    // detect if path is a directory

    if (fs.statSync(path).isDirectory()) {
        fs.mkdirSync(dest);
        var children = fs.readdirSync(path);
        for (var i in children) {
            var child = children[i];
            if (child == "build" || child.startsWith('.')) {
                continue;
            }
            await build(pth.join(path,child),pth.join(dest,child));
        }
    } else {
        var output = "";
        var fileContent = fs.readFileSync(path,"utf-8");

        var configFlag = "@corebuild";
        var staticEval = configFlag + " staticEval";
        var markdown = configFlag + " markdown";

        var useStaticEval = fileContent.includes(staticEval);
        var useMarkdown = fileContent.includes(markdown);

        if (useStaticEval) {
            fileContent = fileContent.split(useStaticEval).join("");
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
            fileContent = "<!DOCTYPE html>" + await marked.parse(fileContent);
            dest = dest.split("md").join("html");
        }

        await fs.promises.writeFile(dest,fileContent);
    }
}

build(__dirname,pth.join(__dirname,"build"));