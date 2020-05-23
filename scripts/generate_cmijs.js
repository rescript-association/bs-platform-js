#!/usr/bin/env node
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");

var libs = require("../third_party_libs.json");

if (!process.env.BS_FOLDER) {
  var defaultBsFolder = path.join(__dirname, "..", "bucklescript");
  console.warn(`BS_FOLDER env var unset, defaulting to ${defaultBsFolder}`);
  process.env.BS_FOLDER = defaultBsFolder;
}
var bsFolder = process.env.BS_FOLDER;

var cmijsDir = path.join(__dirname, "..", "cmijs");
var nativePath = path.join(bsFolder, "native", "4.06.1", "bin");
var OCAMLRUN = path.join(nativePath, "ocamlrun");
var JSOO = path.join(bsFolder, "vendor", "js_of_ocaml.bc");

var config = {
  cwd: cmijsDir,
  encoding: "utf8",
  stdio: [0, 1, 2],
  shell: true,
};

function e(cmd) {
  console.log(`>>>>>> running command: ${cmd}`);
  child_process.execSync(cmd, config);
  console.log(`<<<<<<`);
}

if (!fs.existsSync(cmijsDir)) {
  fs.mkdirSync(cmijsDir);
  fs.mkdirSync(path.join(cmijsDir, "src"));
}

var bsconfigJson = JSON.stringify(
  {
    name: "cmijs",
    version: "0.1.0",
    sources: {
      dir: "src",
      subdirs: true,
    },
    "package-specs": {
      module: "commonjs",
      "in-source": true,
    },
    suffix: ".bs.js",
    "bs-dependencies": libs,
    warnings: {
      error: "+101",
    },
    refmt: 3,
  },
  null,
  2
);

fs.writeFileSync(`/${cmijsDir}/bsconfig.json`, bsconfigJson, {
  encoding: "utf8",
});

var packageJson = JSON.stringify(
  {
    name: "cmijs",
    version: "0.1.0",
    scripts: {
      build: "bsb -make-world",
    },
  },
  null,
  2
);

fs.writeFileSync(`/${cmijsDir}/package.json`, packageJson, {
  encoding: "utf8",
});

libs.forEach(function installLib(lib) {
  e(`yarn add ${lib}`);
});

/* So that postinstall script is executed and node_modules/.bin get symlinks to bs-platform binaries */
e(`yarn add bs-platform`);
/* Requires to have bs-platform linked before running this script */
e(`yarn link bs-platform`);
e(`yarn build`);

libs.forEach(function installLib(lib) {
  var libPath = path.join(cmijsDir, "node_modules", lib, "lib", "ocaml");
  /* module names containing a forward slash like @glennsl/bs-json can't be used as filenames directly */
  var outputFile = lib.replace(/\//g, "__");
  e(
    `find ${libPath} -name "*.cmi" -or -name "*.cmj" | xargs basename | xargs ${OCAMLRUN} ${JSOO} build-fs -o ${outputFile}.js -I ${libPath}`
  );
});

e(`rm -rf lib`);
e(`rm -rf node_modules`);
e(`rm -rf src`);
e(`rm package.json`);
e(`rm bsconfig.json`);
e(`rm yarn.lock`);
e(`rm .merlin`);
