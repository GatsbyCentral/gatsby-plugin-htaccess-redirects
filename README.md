htaccess Redirects in Gatsby
---

If you want to host your Gatsby output with Apache, you can use a `.htaccess`
file to have redirects processed server side. This plugin builds that file for
you.

## Options

The plugin accepts a `prefix` and `suffix` option which get prepended and
appended to the built `.htaccess` file respectively.

Here's an example:

```
{
  resolve: `gatsby-plugin-htaccess-redirects`,
  options: {
    prefix: "<IfModule mod_rewrite.c>\nRewriteEngine On",
    suffix: "</IfModule>",
  },
},
```

## Advanced Options

By default the plugin will build one line per redirect like this:

```
RewriteRule ^from-path/?$ /to-path/ [R=301,L]
```

In apache2 this should cause a redirect from either `/from-path` or `/from-path/` to `/to-path/`. This is built from the pattern `RewriteRule ^%1/?$ %2 [R=%3,L]`. This pattern receives the following replacements:

* `%1` -> `fromPath` (with the leading and trailing slashes removed)
* `%2` -> `toPath` (guaranteed to have a leading and trailing slash)
* `%3` -> Either 302 or 301 if `isPermanent` is `false` or `true` respectively

The option is called `pattern` and can be set like `prefix` and `suffix`.

## Notes

It's currently untested (although expected to work) with a `pathPrefix`. Please
let us know in an issue if you test this and it works (or doesn't).
