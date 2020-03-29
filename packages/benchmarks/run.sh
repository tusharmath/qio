#!/usr/bin/env bash

DESTINATION="../docs/others/benchmarks.md"

cp internals/BENCHMARKS.tmpl.md "$DESTINATION"

ls -d IO/*.js | xargs -L 1 node >> $DESTINATION
