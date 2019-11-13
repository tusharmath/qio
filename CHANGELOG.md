# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [21.2.0](https://github.com/tusharmath/qio/compare/v21.1.3...v21.2.0) (2019-11-13)


### Features

* add http package ([b595baa](https://github.com/tusharmath/qio/commit/b595baa2c5448daa357ccb6d4a13f6a816fa7223))





## [21.1.3](https://github.com/tusharmath/qio/compare/v21.1.2...v21.1.3) (2019-11-07)

**Note:** Version bump only for package qio





## [21.1.2](https://github.com/tusharmath/qio/compare/v21.1.1...v21.1.2) (2019-11-07)

**Note:** Version bump only for package qio





## [21.1.1](https://github.com/tusharmath/qio/compare/v21.1.0...v21.1.1) (2019-11-07)

**Note:** Version bump only for package qio





# [21.1.0](https://github.com/tusharmath/qio/compare/v21.0.2...v21.1.0) (2019-11-07)


### Bug Fixes

* **package:** update dependencies ([e71f2ce](https://github.com/tusharmath/qio/commit/e71f2ced710a3790a7b898b1de895bb61b32a934))
* **package:** update dependencies ([486d8bb](https://github.com/tusharmath/qio/commit/486d8bb864e14ea9d9150ac5da5d79e0ed334600))


### Features

* create @qio/console ([95402f7](https://github.com/tusharmath/qio/commit/95402f71fbe57edbe0eb3ae2955d4fb79013fecb))





## [21.0.2](https://github.com/tusharmath/qio/compare/v21.0.1...v21.0.2) (2019-11-06)

**Note:** Version bump only for package qio





## [21.0.1](https://github.com/tusharmath/qio/compare/v21.0.0...v21.0.1) (2019-11-06)

**Note:** Version bump only for package qio





# [21.0.0](https://github.com/tusharmath/qio/compare/v20.0.6...v21.0.0) (2019-11-06)


### Code Refactoring

* **qio:** change type param arguments for QIO ([966852f](https://github.com/tusharmath/qio/commit/966852fbe0bdc59a5cc4bb34c8b47cc56a197d01))
* **qio:** deprecate IO ([481cdaf](https://github.com/tusharmath/qio/commit/481cdaf0abb5b528c05a54d1f83bcec529920bf1))
* **qio:** deprecate Task and TaskR ([794a163](https://github.com/tusharmath/qio/commit/794a163c9a55d00838ff1a7a55d68014adef002d))
* **qio:** deprecate UIO ([ed20d26](https://github.com/tusharmath/qio/commit/ed20d269d0bcc6dca839b05c8f468b76d4919fe1))


### BREAKING CHANGES

* **qio:** QIO type params have been changed to \`A, E, R\` instead of earlier \`E, A, R\`
* **qio:** deprecate Task and TaskR
* **qio:** UIO have been deprecated. Use QIO.lift() instead.
* **qio:** Deprecating \`IO\` type use \`QIO\` type directly.





## [20.0.6](https://github.com/tusharmath/qio/compare/v20.0.5...v20.0.6) (2019-11-05)

**Note:** Version bump only for package qio





## [20.0.5](https://github.com/tusharmath/qio/compare/v20.0.4...v20.0.5) (2019-11-05)

**Note:** Version bump only for package qio





## [20.0.4](https://github.com/tusharmath/qio/compare/v20.0.3...v20.0.4) (2019-11-05)


### Bug Fixes

* **package:** add publish config ([64aa080](https://github.com/tusharmath/qio/commit/64aa080bd78dafdca44a38e38d428af015dc3539))





## [20.0.3](https://github.com/tusharmath/qio/compare/v20.0.2...v20.0.3) (2019-11-03)


### Bug Fixes

* **package:** publish prelude ([e60145b](https://github.com/tusharmath/qio/commit/e60145b9c03e70e080db4b049a355954dd7e64fb))





## [20.0.2](https://github.com/tusharmath/qio/compare/v20.0.1...v20.0.2) (2019-11-02)

**Note:** Version bump only for package qio





## [20.0.1](https://github.com/tusharmath/qio/compare/v20.0.0...v20.0.1) (2019-10-31)

**Note:** Version bump only for package qio





# [20.0.0](https://github.com/tusharmath/qio/compare/v19.0.2...v20.0.0) (2019-10-31)


### Code Refactoring

* **package:** create a new @qio/stream package ([eaa9f3d](https://github.com/tusharmath/qio/commit/eaa9f3d55db1176884c93da1ab3d1ec586ec0db9))
* **stream:** rename FStream to Stream ([9d99b9b](https://github.com/tusharmath/qio/commit/9d99b9b31a367e5ed0f1f141f5d9324bdb7c5199))


### BREAKING CHANGES

* **stream:** Renaming FStream to Stream
* **package:** FStream has been removed from @qio/core to @qio/stream





## [19.0.2](https://github.com/tusharmath/qio/compare/v19.0.1...v19.0.2) (2019-10-31)

**Note:** Version bump only for package qio





## [19.0.1](https://github.com/tusharmath/qio/compare/v19.0.0...v19.0.1) (2019-10-30)

**Note:** Version bump only for package qio





# [19.0.0](https://github.com/tusharmath/qio/compare/v18.0.7...v19.0.0) (2019-10-30)


### Bug Fixes

* **fiber:** handle cancellation callbacks while using await ([a74924d](https://github.com/tusharmath/qio/commit/a74924dff119d4f4041c2946c9d961a87436066a))


### BREAKING CHANGES

* **fiber:** remove \`Fiber.release\`





## [18.0.7](https://github.com/tusharmath/qio/compare/v18.0.6...v18.0.7) (2019-10-25)

**Note:** Version bump only for package qio





## [18.0.6](https://github.com/tusharmath/qio/compare/v18.0.5...v18.0.6) (2019-10-25)

**Note:** Version bump only for package qio





## [18.0.5](https://github.com/tusharmath/qio/compare/v18.0.4...v18.0.5) (2019-10-24)

**Note:** Version bump only for package qio





## [18.0.4](https://github.com/tusharmath/qio/compare/v18.0.3...v18.0.4) (2019-10-24)

**Note:** Version bump only for package qio





## [18.0.3](https://github.com/tusharmath/qio/compare/v18.0.2...v18.0.3) (2019-10-24)

**Note:** Version bump only for package qio





## [18.0.2](https://github.com/tusharmath/qio/compare/v18.0.1...v18.0.2) (2019-10-24)

**Note:** Version bump only for package qio





## [18.0.1](https://github.com/tusharmath/qio/compare/v18.0.0...v18.0.1) (2019-10-24)

**Note:** Version bump only for package qio





# [18.0.0](https://github.com/tusharmath/qio/compare/v16.2.3...v18.0.0) (2019-10-24)


### Bug Fixes

* **package:** remove __tests__ from the package ([4466547](https://github.com/tusharmath/qio/commit/4466547ce1af82da98e4e21053b52cd02ae3cc43))
* **package:** test deploy script ([8bcb2f8](https://github.com/tusharmath/qio/commit/8bcb2f841612acd219aeaf8210a7bc6d380bb871))
* **package:** update dependencies ([38bbfca](https://github.com/tusharmath/qio/commit/38bbfca0e57aebbd384cbf7e0b64469e5d927f34))


### Code Refactoring

* **package:** rename FIO to QIO due to package name's unavailability. ([0b8fa3f](https://github.com/tusharmath/qio/commit/0b8fa3fbb7b9aea52bedaf6571f70f3d5b16032f))


### BREAKING CHANGES

* **package:** Renaming package.





# [17.0.0](https://github.com/tusharmath/qio/compare/v16.2.3...v17.0.0) (2019-10-24)


### Bug Fixes

* **package:** update dependencies ([e64bdf5](https://github.com/tusharmath/qio/commit/e64bdf541c84d1206fe4c2784affd76d11b02aaa))


### Code Refactoring

* **package:** rename FIO to QIO due to package name's unavailability. ([68b0d97](https://github.com/tusharmath/qio/commit/68b0d97ebaa4b019f6929d975fc8b5b810a58e7e))


### BREAKING CHANGES

* **package:** Renaming package.





## [16.2.3](https://github.com/tusharmath/qio/compare/v16.2.2...v16.2.3) (2019-10-23)

**Note:** Version bump only for package qio





## [16.2.2](https://github.com/tusharmath/qio/compare/v16.2.1...v16.2.2) (2019-10-23)


### Bug Fixes

* **package:** update dependencies ([c17af47](https://github.com/tusharmath/qio/commit/c17af4797f4f67b270048df0656a42da88f25397))
* **package:** update lock file ([4e24a3b](https://github.com/tusharmath/qio/commit/4e24a3b4bd183c40036f7f0c8e8ea6f3ceffd845))
