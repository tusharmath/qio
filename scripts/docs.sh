#!/usr/bin/env bash


cd packages/website
yarn build
cd ../../

yarn typedoc --plugin typedoc-plugin-markdown;
