const fs = require("fs-extra");
const fp = require("lodash/fp");
const path = require("path");

// The default pattern to build the redirects
// %1 = fromPath
// %2 = toPath
// %3 = 301 or 302 dependin on isPermanent === true or isPermanent === false
const defaultPattern = "RewriteRule ^%1/?$ %2 [R=%3,L]";

const trimSlashes = fp.trimChars("/");

// This returns a function with the value of `pattern` bound.
const redirectToHtaccessStringFactory =
  (pattern) =>
  ({ fromPath, toPath, isPermanent, withSlash = true }) =>
    pattern
      // Ensure neither leading nor trailing slash
      .replace("%1", trimSlashes(fromPath))
      // Ensure both leading and trailin slashes
      .replace("%2", `/${trimSlashes(toPath)}${withSlash ? '/' : ''}`)
      .replace("%3", isPermanent ? "301" : "302");
// `Redirect ${
//   isPermanent ? "301" : "302"
// } ${pathPrefix}${fromPath} ${pathPrefix}${toPath}`;

exports.onPostBuild = ({ store }, pluginOptions) => {
  const {
    // This is the default pattern
    pattern = defaultPattern,
    prefix,
    suffix,
  } = pluginOptions;
  const { redirects, program } = store.getState();

  // Create a `redirectToHtaccessString()` function and pass a value for
  // `pathPrefix` if one is required, otherwise an empty string.
  const redirectToHtaccessString = redirectToHtaccessStringFactory(pattern);

  // NOTE: We could include teh `pathPrefix` like this, but probably don't need
  // to. We assume that the `.htaccess` file will be installed at `/path/` if
  // the Gatsby site is being deployed to `/path/`. This is untested and will
  // need checked if this plugin should support `pathPrefix`.
  // const { program, config } = store.getState();
  // const pathPrefix = program.prefixPaths ? config.pathPrefix : ""

  // The path where we want to write the file `public/.htaccess`
  const htaccessPath = path.join(program.directory, "public/.htaccess");

  // Generate the contents of the `.htaccess` file as a single string. This
  // wraps the prefix and suffix around one line per redirect. We iterate over
  // the array of redirects passing each one to `redirectToHtaccessString()`, then
  // call `.join()` on the resulting array to create a single string with each
  // line separated by a "\n".
  const htaccessContent = `\n${prefix ? prefix + "\n" : ""}${fp
    .map(redirectToHtaccessString, redirects)
    .join("\n")}${suffix ? "\n" + suffix : ""}\n`;

  // Return a promise chain
  return (
    fs
      // Make sure that our .htaccess file and all its required parent
      // directories exist
      .ensureFile(htaccessPath)
      .then(() => {
        // Write the contents of the file
        return fs.writeFile(htaccessPath, htaccessContent, { flag: "a" });
      })
      .catch((e) => {
        // Log any errors thrown
        console.error("onPostBuild error #hq0Kxa", JSON.stringify(e));
      })
  );
};
