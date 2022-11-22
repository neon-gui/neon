var fs = require("fs");
const fse = require('fs-extra');
var pth = require("path");
var corebuildTag = "<." + ">";

// delete build folder

if (fs.existsSync(pth.join(__dirname,"build"))) {
    fs.rmdirSync(pth.join(__dirname,"build"),{
        recursive:true,
        force:true
    });    
}

// copy all files into build folder

function build(path,dest) {
    //console.log("building " + path);

    // detect if path is a directory

    if (fs.statSync(path).isDirectory()) {
        fs.mkdirSync(dest);
        var children = fs.readdirSync(path);
        for (var i in children) {
            var child = children[i];
            if (child == "build") {
                continue;
            }
            build(pth.join(path,child),pth.join(dest,child));
        }
    } else {
        var output = "";
        var fileContent = fs.readFileSync(path,"utf-8");
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

        fs.writeFileSync(dest,output);
    }
}

build(__dirname,pth.join(__dirname,"build"));