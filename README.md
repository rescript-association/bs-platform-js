# bs-platform-js

Release pipeline for ReasonML / BuckleScript JavaScript bundles and rolling releases.

## Nightly builds

This repository runs every day to generate an `exports.js` file that can be loaded in the browser or Node, in order
to run the BuckleScript compiler in those environments.

To see the latest builds, go to the [Actions](https://github.com/reason-association/bs-platform-js/actions) page. In the
"Artifacts" section, the latest bundle can be downloaded.

## 3rd party libraries cmi and cmj files

The main `exports.js` only allows to load modules from BuckleScript standard library. To be able to load modules from
3rd party libraries, there needs to be some precompilation of the library, and then generation of a file `cmij.js`
with the binary representation of the `.cmi` and `.cmj` files generated after compilation takes place.

To automate this process, the repository artifact includes a folder `packages` that contains a subfolder for each of the
packages listed in `third_party_packages.json`. The folder contains said `cmij.js` plus all the runtime `.js` files
that resulted from the compilation, so they can be used if needed to run the resulting code from compilation.

Example:

```
packages
├── @glennsl
│   └── bs-json
│       ├── Json.bs.js
│       ├── Json_decode.bs.js
│       ├── Json_encode.bs.js
│       └── cmij.js
└── reason-react
    ├── React.js
    ├── ReactDOMRe.js
    ├── ReactDOMServerRe.js
    ├── ReactEvent.js
    ├── ReactEventRe.js
    ├── ReasonReact.js
    ├── ReasonReactCompat.js
    ├── ReasonReactOptimizedCreateClass.js
    ├── ReasonReactRouter.js
    └── cmij.js
```
