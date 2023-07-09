#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

case `uname` in
    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

relative_paths="
../packages/docoddity/dist/bin/node_modules
../packages/docoddity/dist/node_modules
../packages/docoddity/node_modules
../packages/node_modules
../node_modules
../../node_modules
/node_modules
../packages/docoddity/node_modules/.pnpm/node_modules
"

NODE_PATH=""
for path in $relative_paths
do
  full_path="$basedir/$path"
  if [ -d "$full_path" ]; then
    if [ -z "$NODE_PATH" ]; then
      NODE_PATH="$full_path"
    else
      NODE_PATH="$NODE_PATH:$full_path"
    fi
  fi
done

export NODE_PATH

if [ -x "$basedir/node" ]; then
  exec "$basedir/node" "$basedir/../docoddity/dist/bin/cli.js" "$@"
else
  exec node "$basedir/../docoddity/dist/bin/cli.js" "$@"
fi
