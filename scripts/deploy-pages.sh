#!/bin/sh
# Builds the site and publishes it to GitHub Pages (the gh-pages branch).
# The site lives at https://<user>.github.io/mindstack/, so if you rename the repo, change BASE too.
set -e
BASE=/mindstack/

npm run build -- --base="$BASE"
cp dist/index.html dist/404.html   # so links like /learn/... open the app instead of GitHub's 404 page
touch dist/.nojekyll

REMOTE=$(git remote get-url origin)
NAME=$(git config user.name)
EMAIL=$(git config user.email)
COMMIT=$(git rev-parse --short HEAD)

cd dist
git init -q -b gh-pages
git add -A
git -c user.name="$NAME" -c user.email="$EMAIL" commit -q -m "Deploy $COMMIT"
git push -f -q "$REMOTE" gh-pages
rm -rf .git
echo "Published. It can take a minute to show up."
