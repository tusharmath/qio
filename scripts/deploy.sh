#!/usr/bin/env bash

# Constants
DEPLOY_BRANCH="master"
GH_USER="tusharmath"
GH_PROJECT="qio"


# Deploy
if [[ "${TRAVIS_BRANCH}" == ${DEPLOY_BRANCH} ]]; then
    git config --global user.email travis@travis-ci.org
    git config --global user.name Travis CI
    git remote set-url origin "https://${GH_TOKEN}@github.com/${GH_USER}/${GH_PROJECT}.git" > /dev/null 2>&1
    git checkout "${DEPLOY_BRANCH}"
    echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" >> $HOME/.npmrc 2> /dev/null
    lerna publish --conventional-commits --yes
else
    echo "Not ${DEPLOY_BRANCH} branch, skipping publishing"
fi