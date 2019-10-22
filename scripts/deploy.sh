#!/usr/bin/env bash

# Constants
DEPLOY_BRANCH="master"

# Deploy
if [[ "${TRAVIS_BRANCH}" == ${DEPLOY_BRANCH} ]]; then
    lerna publish --conventional-commits --yes
else
    echo "Not ${DEPLOY_BRANCH} branch, skipping publishing"
fi