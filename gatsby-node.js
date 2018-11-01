const fs = require("fs-extra");
const fp = require("lodash/fp");
const path = require("path");

// This returns a function with the value of `pathPrefix` bound.
const createLineForRedirectFactory = pathPrefix => ({
  fromPath,
  toPath,
  isPermanent
}) =>
  `Redirect ${
    isPermanent ? "301" : "302"
  } ${pathPrefix}${fromPath} ${pathPrefix}${toPath}`;

exports.onPostBuild = ({ store }, pluginOptions) => {
  const { redirects, program, config } = store.getState();

  // Create a `createLineForRedirect()` function and pass a value for
  // `pathPrefix` if one is required, otherwise an empty string.
  const createLineForRedirect = createLineForRedirectFactory(
    program.prefixPaths ? config.pathPrefix : ""
  );

  // The path where we want to write the file `public/.htaccess`
  const htaccessPath = path.join(program.directory, "public/.htaccess");

  // Generate the contents of the `.htaccess` file as a single string. This
  // wraps the prefix and suffix around one line per redirect. We iterate over
  // the array of redirects passing each one to `createLineForRedirect()`, then
  // call `.join()` on the resulting array to create a single string with each
  // line separated by a "\n".
  const htaccessContent = `${
    pluginOptions.prefix ? pluginOptions.prefix + "\n" : ""
  }${fp.map(createLineForRedirect, redirects).join("\n")}${
    pluginOptions.suffix ? "\n" + pluginOptions.suffix : ""
  }`;

  // Return a promise chain
  return (
    fs
      // Make sure that our .htacess file and all its required parent
      // directories exist
      .ensureFile(htaccessPath)
      .then(() => {
        // Write the contents of the file
        return fs.writeFile(htaccessPath, htaccessContent);
      })
      .catch(e => {
        // Log any errors thrown
        console.error("onPostBuild error #hq0Kxa", JSON.stringify(e));
      })
  );
};
