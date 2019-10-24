#!/usr/bin/env bash

cp internals/BENCHMARKS.tmpl.md $2

ls -d $1/*.js | xargs -L 1 node >> $2
