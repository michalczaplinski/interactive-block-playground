### Interactive Block Playground 

Built with [WordPress Playground](https://github.com/WordPress/wordpress-playground).



https://user-images.githubusercontent.com/5417266/233141638-b8143576-fb56-462d-9abb-fce117ba84ba.mov



### How to run it:

You'll need to run a local server at the root of the repo. For example:

```sh
python -m http.server
```

After that, just:

```sh
npm start
```

to run the `tsc` compiler.

If you want to make any changes to the `hello` plugin, you should run:

```sh
node build-zips.cjs
```

This will watch the `hello` folder for chagnes and build and compress the plugin
to `zips/hello`.
