#!/usr/bin/env node
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");

var packages = require("../third_party_packages.json");

if (!process.env.BS_FOLDER) {
  var defaultBsFolder = path.join(__dirname, "..", "..", "bucklescript");
  console.warn(`BS_FOLDER env var unset, defaulting to ${defaultBsFolder}`);
  process.env.BS_FOLDER = defaultBsFolder;
}
var bsFolder = process.env.BS_FOLDER;

var packagesDir = path.join(__dirname, "..", "packages");
var nativePath = path.join(bsFolder, "native", "4.06.1", "bin");
var OCAMLRUN = path.join(nativePath, "ocamlrun");
var JSOO = path.join(bsFolder, "vendor", "js_of_ocaml.bc");

var config = {
  cwd: packagesDir,
  encoding: "utf8",
  stdio: [0, 1, 2],
  shell: true,
};

function e(cmd) {
  console.log(`>>>>>> running command: ${cmd}`);
  child_process.execSync(cmd, config);
  console.log(`<<<<<<`);
}

if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir);
}
if (!fs.existsSync(path.join(packagesDir, "src"))) {
  fs.mkdirSync(path.join(packagesDir, "src"));
}

var bsconfigJson = JSON.stringify(
  {
    name: "packages",
    version: "0.1.0",
    sources: {
      dir: "src",
      subdirs: true,
    },
    "package-specs": {
      module: "commonjs",
      "in-source": false,
    },
    suffix: ".bs.js",
    "bs-dependencies": packages,
    warnings: {
      error: "+101",
    },
    refmt: 3,
  },
  null,
  2
);

fs.writeFileSync(`/${packagesDir}/bsconfig.json`, bsconfigJson, {
  encoding: "utf8",
});

var packageJson = JSON.stringify(
  {
    name: "packages",
    version: "0.1.0",
    scripts: {
      build: "bsb -make-world",
    },
  },
  null,
  2
);

fs.writeFileSync(`/${packagesDir}/package.json`, packageJson, {
  encoding: "utf8",
});

packages.forEach(function installLib(package) {
  e(`yarn add ${package}`);
});

/* So that postinstall script is executed and node_modules/.bin get symlinks to bs-platform binaries */
e(`yarn add bs-platform`);
/* Requires to have bs-platform linked before running this script */
e(`yarn link bs-platform`);
e(`yarn build`);

packages.forEach(function installLib(package) {
  var libOcamlFolder = path.join(packagesDir, "node_modules", package, "lib", "ocaml");
  var libJsFolder = path.join(packagesDir, "node_modules", package, "lib", "js");
  var outputFolder = path.join(packagesDir, package);
  var cmijFile = path.join(outputFolder, `cmij.js`);
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  e(
    `find ${libJsFolder} -name '*.js' -exec cp {} ${outputFolder} \\;`
  );
  e(
    `find ${libOcamlFolder} -name "*.cmi" -or -name "*.cmj" | xargs -n1 basename | xargs ${OCAMLRUN} ${JSOO} build-fs -o ${cmijFile} -I ${libOcamlFolder}`
  );
});

e(`rm -rf lib`);
e(`rm -rf node_modules`);
e(`rm -rf src`);
e(`rm package.json`);
e(`rm bsconfig.json`);
e(`rm yarn.lock`);
e(`rm .merlin`);
