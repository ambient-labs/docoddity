# docoddity

A simple documentation static site generator that uses web components. Primarily intended for libraries.

## Quickstart

In your library, create a `docs` folder:

```bash
mkdir docs
```

Create a `package.json` and install `docoddity` as a dependency:

```json
{
  "name": "@my-library/docs",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "docoddity start --port 8080",
    "build": "docoddity build --output ./build",
    "serve": "pnpx serve ./build"
  },
  "devDependencies": {
    "docoddity": "latest"
  }
}
```

Add some content:

```bash
touch content/index.md
```

And run!

```bash
pnpm dev
```
