const fs = require("fs-extra");
const fp = require("lodash/fp");
const path = require("path");

exports.onPostBuild = ({ store }) => {
  const { redirects, program, config } = store.getState();

  // Get the `pathPrefix` if one is required, or use an empty string
  const pathPrefix = program.prefixPaths ? config.pathPrefix : "";

  const htaccessPath = path.join(program.directory, "public/.htaccess");

  // Build an array of redirect strings that we can `.join()` into a file
  const htaccessLines = fp.map(
    ({ fromPath, toPath, isPermanent }) =>
      `Redirect ${
        isPermanent ? "301" : "302"
      } ${pathPrefix}${fromPath} ${pathPrefix}${toPath}`,
    redirects
  );

  return fs
    .ensureFile(htaccessPath)
    .then(() => {
      return fs.writeFile(htaccessPath, htaccessLines.join("\n"));
    })
    .catch(e => {
      console.error("onPostBuild error #hq0Kxa", JSON.stringify(e));
    });
};
