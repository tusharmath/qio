# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [22.0.2](https://github.com/tusharmath/qio/compare/v22.0.1...v22.0.2) (2019-11-16)

**Note:** Version bump only for package @qio/stream





# [22.0.0](https://github.com/tusharmath/qio/compare/v21.2.1...v22.0.0) (2019-11-16)

**Note:** Version bump only for package @qio/stream

# [21.0.0](https://github.com/tusharmath/qio/compare/v20.0.6...v21.0.0) (2019-11-06)

### Code Refactoring

- **qio:** change type param arguments for QIO ([966852f](https://github.com/tusharmath/qio/commit/966852fbe0bdc59a5cc4bb34c8b47cc56a197d01))
- **qio:** deprecate UIO ([ed20d26](https://github.com/tusharmath/qio/commit/ed20d269d0bcc6dca839b05c8f468b76d4919fe1))

### BREAKING CHANGES

- **qio:** QIO type params have been changed to \`A, E, R\` instead of earlier \`E, A, R\`
- **qio:** UIO have been deprecated. Use QIO.lift() instead.

## [20.0.4](https://github.com/tusharmath/qio/compare/v20.0.3...v20.0.4) (2019-11-05)

**Note:** Version bump only for package @qio/stream

## [20.0.3](https://github.com/tusharmath/qio/compare/v20.0.2...v20.0.3) (2019-11-03)

**Note:** Version bump only for package @qio/stream

## [20.0.1](https://github.com/tusharmath/qio/compare/v20.0.0...v20.0.1) (2019-10-31)

**Note:** Version bump only for package @qio/stream

# [20.0.0](https://github.com/tusharmath/qio/compare/v19.0.2...v20.0.0) (2019-10-31)

### Code Refactoring

- **package:** create a new @qio/stream package ([eaa9f3d](https://github.com/tusharmath/qio/commit/eaa9f3d55db1176884c93da1ab3d1ec586ec0db9))
- **stream:** rename FStream to Stream ([9d99b9b](https://github.com/tusharmath/qio/commit/9d99b9b31a367e5ed0f1f141f5d9324bdb7c5199))

### BREAKING CHANGES

- **stream:** Renaming FStream to Stream
- **package:** FStream has been removed from @qio/core to @qio/stream
