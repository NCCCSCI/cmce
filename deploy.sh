#!/usr/bin/env sh

# Thanks to: https://cli.vuejs.org/guide/deployment.html#github-pages

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

#git init
git add -A
git commit -m 'deploy'

# deploy to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:bgamrat/nolo.git main:gh-pages

cd -
