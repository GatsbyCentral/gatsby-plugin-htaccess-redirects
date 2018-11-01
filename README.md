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

## Notes

It's currently untested (although expected to work) with a `pathPrefix`. Please
let us know in an issue if you test this and it works (or doesn't).
