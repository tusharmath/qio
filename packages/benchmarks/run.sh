#!/usr/bin/env bash

FILE_NAME="$1/BENCHMARKS.md"
echo "# Benchmarks" > "${FILE_NAME}"
ls -d $1/*.js | xargs -L 1 node >> "${FILE_NAME}"
