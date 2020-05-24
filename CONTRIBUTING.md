## Running the 3rd party packages generation script locally

To run `generate_packages.js` locally, you will need to clone the `bucklescript` folder, preferably adjacent to
`bs-platform-js` folder:

```
git clone https://github.com/BuckleScript/bucklescript/
```

Then, from `bs-platform-js` root folder, use the `BS_FOLDER` environment variable to indicate the relative path from the
folder where the `generate_packages` script is placed, to the locally installation of the `bucklescript` repo, e.g.:

```bash
# `bucklescript` is a sibling folder of `bs-platform-js`
BS_FOLDER=../../bucklescript ./scripts/generate_packages.js
```
