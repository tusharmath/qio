#!/usr/bin/env bash

yarn doc:typedoc
yarn workspace @qio/website run build
