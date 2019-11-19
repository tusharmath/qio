# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [25.0.0](https://github.com/tusharmath/qio/compare/v24.0.0...v25.0.0) (2019-11-19)

**Note:** Version bump only for package @qio/core





# [24.0.0](https://github.com/tusharmath/qio/compare/v23.0.0...v24.0.0) (2019-11-18)


### Code Refactoring

* **reservation:** change type signature ([e17c143](https://github.com/tusharmath/qio/commit/e17c14311e89fc92a16461423d4df174084045ce))


### BREAKING CHANGES

* **reservation:** Reservation.release can now throw exceptions





# [23.0.0](https://github.com/tusharmath/qio/compare/v22.0.5...v23.0.0) (2019-11-17)


### Code Refactoring

* **qio:** rename of() to resolve() ([edb0d14](https://github.com/tusharmath/qio/commit/edb0d148fdbe4115fe1f664e765403288d590aae))


### BREAKING CHANGES

* **qio:** renaming \`QIO.of()\` to \`QIO.resolve()\`





## [22.0.2](https://github.com/tusharmath/qio/compare/v22.0.1...v22.0.2) (2019-11-16)

**Note:** Version bump only for package @qio/core





# [22.0.0](https://github.com/tusharmath/qio/compare/v21.2.1...v22.0.0) (2019-11-16)

### Bug Fixes

- update dependencies ([d511865](https://github.com/tusharmath/qio/commit/d511865178030c6fc09cef9f164d7d215bccb91c))

### Code Refactoring

- **qio:** change QIO.node signature ([a1bc4d8](https://github.com/tusharmath/qio/commit/a1bc4d89a7ddfc2fad79083248147ba76939f189))

### BREAKING CHANGES

- **qio:** QIO.node node returns a TUPLE of values.

# [21.0.0](https://github.com/tusharmath/qio/compare/v20.0.6...v21.0.0) (2019-11-06)

### Code Refactoring

- **qio:** change type param arguments for QIO ([966852f](https://github.com/tusharmath/qio/commit/966852fbe0bdc59a5cc4bb34c8b47cc56a197d01))
- **qio:** deprecate IO ([481cdaf](https://github.com/tusharmath/qio/commit/481cdaf0abb5b528c05a54d1f83bcec529920bf1))
- **qio:** deprecate Task and TaskR ([794a163](https://github.com/tusharmath/qio/commit/794a163c9a55d00838ff1a7a55d68014adef002d))
- **qio:** deprecate UIO ([ed20d26](https://github.com/tusharmath/qio/commit/ed20d269d0bcc6dca839b05c8f468b76d4919fe1))

### BREAKING CHANGES

- **qio:** QIO type params have been changed to \`A, E, R\` instead of earlier \`E, A, R\`
- **qio:** deprecate Task and TaskR
- **qio:** UIO have been deprecated. Use QIO.lift() instead.
- **qio:** Deprecating \`IO\` type use \`QIO\` type directly.

## [20.0.4](https://github.com/tusharmath/qio/compare/v20.0.3...v20.0.4) (2019-11-05)

**Note:** Version bump only for package @qio/core

## [20.0.3](https://github.com/tusharmath/qio/compare/v20.0.2...v20.0.3) (2019-11-03)

**Note:** Version bump only for package @qio/core

## [20.0.1](https://github.com/tusharmath/qio/compare/v20.0.0...v20.0.1) (2019-10-31)

**Note:** Version bump only for package @qio/core

# [20.0.0](https://github.com/tusharmath/qio/compare/v19.0.2...v20.0.0) (2019-10-31)

### Code Refactoring

- **package:** create a new @qio/stream package ([eaa9f3d](https://github.com/tusharmath/qio/commit/eaa9f3d55db1176884c93da1ab3d1ec586ec0db9))

### BREAKING CHANGES

- **package:** FStream has been removed from @qio/core to @qio/stream

## [19.0.2](https://github.com/tusharmath/qio/compare/v19.0.1...v19.0.2) (2019-10-31)

**Note:** Version bump only for package @qio/core

# [19.0.0](https://github.com/tusharmath/qio/compare/v18.0.7...v19.0.0) (2019-10-30)

### Bug Fixes

- **fiber:** handle cancellation callbacks while using await ([a74924d](https://github.com/tusharmath/qio/commit/a74924dff119d4f4041c2946c9d961a87436066a))

### BREAKING CHANGES

- **fiber:** remove \`Fiber.release\`

## [18.0.1](https://github.com/tusharmath/qio/compare/v18.0.0...v18.0.1) (2019-10-24)

**Note:** Version bump only for package @qio/core

# [18.0.0](https://github.com/tusharmath/qio/compare/v16.2.3...v18.0.0) (2019-10-24)

### Bug Fixes

- **package:** update dependencies ([38bbfca](https://github.com/tusharmath/qio/commit/38bbfca0e57aebbd384cbf7e0b64469e5d927f34))

### Code Refactoring

- **package:** rename FIO to QIO due to package name's unavailability. ([0b8fa3f](https://github.com/tusharmath/qio/commit/0b8fa3fbb7b9aea52bedaf6571f70f3d5b16032f))

### BREAKING CHANGES

- **package:** Renaming package.

# [17.0.0](https://github.com/tusharmath/qio/compare/v16.2.3...v17.0.0) (2019-10-24)

### Bug Fixes

- **package:** update dependencies ([e64bdf5](https://github.com/tusharmath/qio/commit/e64bdf541c84d1206fe4c2784affd76d11b02aaa))

### Code Refactoring

- **package:** rename FIO to QIO due to package name's unavailability. ([68b0d97](https://github.com/tusharmath/qio/commit/68b0d97ebaa4b019f6929d975fc8b5b810a58e7e))

### BREAKING CHANGES

- **package:** Renaming package.

## [16.2.3](https://github.com/tusharmath/qio/compare/v16.2.2...v16.2.3) (2019-10-23)

**Note:** Version bump only for package @qio/core

## [16.2.2](https://github.com/tusharmath/qio/compare/v16.2.1...v16.2.2) (2019-10-23)

### Bug Fixes

- **package:** update dependencies ([c17af47](https://github.com/tusharmath/qio/commit/c17af4797f4f67b270048df0656a42da88f25397))
