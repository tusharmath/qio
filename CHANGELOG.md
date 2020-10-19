# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [31.1.1](https://github.com/tusharmath/qio/compare/v31.1.0...v31.1.1) (2020-10-19)


### Performance Improvements

* **fiber:** add basic performance optimizations ([fffed03](https://github.com/tusharmath/qio/commit/fffed033f224f9777d2392f033f009b3055aa878))





# [31.1.0](https://github.com/tusharmath/qio/compare/v31.0.1...v31.1.0) (2020-03-29)


### Bug Fixes

* update dependencies ([06fbfd2](https://github.com/tusharmath/qio/commit/06fbfd2ef833e56f802c4222a9d16f8782a91c10))
* update tsc version to 3.8 ([ff4ece0](https://github.com/tusharmath/qio/commit/ff4ece0e4d67ec686446461d56a684884307cd71))
* **queue:** fix offer implementation ([5c474f6](https://github.com/tusharmath/qio/commit/5c474f63c61e75fdaac726bbd7b2dabca16b5080))


### Features

* **await:** add \`setTo\` helper function ([f787b18](https://github.com/tusharmath/qio/commit/f787b18f03676ea33f67acfb5f229f2bb3e31ece))
* **chunk:** add chunking capabilities. ([2941622](https://github.com/tusharmath/qio/commit/29416224b767d0fb279a88834b31934609d83053))
* **core:** add \`Flag\` type ([d71a0be](https://github.com/tusharmath/qio/commit/d71a0bee77eca84e722d7d3e21353d0feb89c466))
* **stream:** add \`zipWith\` operator ([c594d5a](https://github.com/tusharmath/qio/commit/c594d5a6596e6ee66344a4379e42fd6df382a125))
* **stream:** add multiple operators ([b2a188a](https://github.com/tusharmath/qio/commit/b2a188a83706db014e4d0884dc149075f9d3086b))


### Performance Improvements

* **qio:** make \`map\` and \`chain\` eager only if it's being applied on a \`constant\` value. ([1ca41c6](https://github.com/tusharmath/qio/commit/1ca41c6039e63a9ed63cab0c425c43b86e2cb5a2))





## [31.0.1](https://github.com/tusharmath/qio/compare/v31.0.0...v31.0.1) (2020-01-28)


### Bug Fixes

* **stream:** update exported module name ([1c9e6a9](https://github.com/tusharmath/qio/commit/1c9e6a91732c3424e042fbf201cb3ba6a974b4a9))





# [31.0.0](https://github.com/tusharmath/qio/compare/v30.0.1...v31.0.0) (2020-01-28)


### Bug Fixes

* **queue:** fix \`takeN\` bug ([a694f51](https://github.com/tusharmath/qio/commit/a694f5181c4f65fb455ededc7b08bea0ab2e1650))


### Code Refactoring

* **stream:** rename to QStream ([684db9d](https://github.com/tusharmath/qio/commit/684db9d6436875a4dd96f272048879bf7dd224cc))


### Features

* **core:** export \`Counter\` for use ([ca92e1d](https://github.com/tusharmath/qio/commit/ca92e1d436ba27155aac1e8bd6aecaaa4541cf9c))
* **stream:** add \`scan\` operator ([a7cf4a8](https://github.com/tusharmath/qio/commit/a7cf4a896457c0cbd38d1ed86abc1f43109ecbdf))
* **stream:** add toQueue ([2eb34c0](https://github.com/tusharmath/qio/commit/2eb34c012755bc4b6ed57d9129190662747916e8))


### BREAKING CHANGES

* **stream:** Renaming Stream to QStream





## [30.0.1](https://github.com/tusharmath/qio/compare/v30.0.0...v30.0.1) (2019-12-31)

**Note:** Version bump only for package qio





# [30.0.0](https://github.com/tusharmath/qio/compare/v29.2.1...v30.0.0) (2019-12-29)


### Bug Fixes

* **package:** export TestRuntime as a parameter ([4a7a9e6](https://github.com/tusharmath/qio/commit/4a7a9e6ea32d3ee8d6cbde3d445ce4100cdadcdf))


### Code Refactoring

* **stream:** simplify \`Stream.fromEventEmitter\` API ([57a60e9](https://github.com/tusharmath/qio/commit/57a60e961482995b6df6daa088d88d20111a83e8))


### Features

* **qio:** add \`QIO.tap\` ([9c68d80](https://github.com/tusharmath/qio/commit/9c68d80a0bbad51df9c83916df9076224898a0ee))
* **stream:** add \`holdFor\` operator in stream ([357886d](https://github.com/tusharmath/qio/commit/357886d75e566d896ee526c00ef07a26ec2b76b1))


### BREAKING CHANGES

* **qio:** \`QIO.tap\` signature has been updated to accept a function that doesn't return a \`QIO\`. Use
\`QIO.tapM\` if you still want to pass a function that returns a \`QIO\`.
* **stream:** \`fromEventEmiter\` API has been updated.





## [29.2.1](https://github.com/tusharmath/qio/compare/v29.2.0...v29.2.1) (2019-12-28)


### Bug Fixes

* **dependency:** update ts-scheduler dependency ([6063549](https://github.com/tusharmath/qio/commit/606354954306bb3a3e327b3f143a78e46b7eeece))
* fix dependencies ([05182b9](https://github.com/tusharmath/qio/commit/05182b93884badc18588275e91ba10de81392af0))
* **haltWhenM:** fix \`haltWhenM\` when provided \`QIO<never>\` ([589d8e5](https://github.com/tusharmath/qio/commit/589d8e5c9649a68484dccd3fb5142c5b47c78e17))





# [29.2.0](https://github.com/tusharmath/qio/compare/v29.1.0...v29.2.0) (2019-12-27)


### Features

* **haltWhenM:** add support for QIO<A, E, R> ([6b9705b](https://github.com/tusharmath/qio/commit/6b9705b8c82525c0e929618df8a4253886e9e243))





# [29.1.0](https://github.com/tusharmath/qio/compare/v29.0.5...v29.1.0) (2019-12-27)


### Bug Fixes

* **await:** fix \`isSet\` implementation ([4fc9185](https://github.com/tusharmath/qio/commit/4fc918587d83335d389270927ccd4222982b13e6))


### Features

* **scanM:** add \`Stream.scanM\` operator ([e7cb7d0](https://github.com/tusharmath/qio/commit/e7cb7d042ec3747d9518aab4669a9d07b2177d88))
* **stream:** add support for \`haltWhen\` ([8674aea](https://github.com/tusharmath/qio/commit/8674aeab7d89027a2da49fb41e7de3f4d1d6c6ab))
* **stream:** add support for \`haltWhenM\` ([9179186](https://github.com/tusharmath/qio/commit/917918695927c41ff71678facfd15f601979899b))





## [29.0.2](https://github.com/tusharmath/qio/compare/v29.0.1...v29.0.2) (2019-12-24)


### Bug Fixes

* **script:** change npmignore paths ([6acc109](https://github.com/tusharmath/qio/commit/6acc109cb3d36d719648b072ac586b8a5c89248d))





# [29.0.0](https://github.com/tusharmath/qio/compare/v28.1.3...v29.0.0) (2019-12-20)


### Bug Fixes

* **managed:** fix resource holding ([908db4b](https://github.com/tusharmath/qio/commit/908db4b89b595b60737f7e5c739e52e2b29e97c2))


### Code Refactoring

* **fiber:** remove dependency on \`Either\` type internally. ([db926a8](https://github.com/tusharmath/qio/commit/db926a8934013c2543888ae055c329230902078d))
* **managed:** update function signature for \`Managed.do\` ([75ba5a6](https://github.com/tusharmath/qio/commit/75ba5a63a8d400b878099167953ac9304c396ab4))


### Features

* **package:** export \`Exit\` for external use ([6c044d0](https://github.com/tusharmath/qio/commit/6c044d07a7167a58206024aeaec6247de5b0e760))
* **qio:** add \`QIO.bracket_\` ([93428a4](https://github.com/tusharmath/qio/commit/93428a499db48485d8ec8b9dbc8cbee4f4b97128))
* **qio:** add \`QIO.bracket\` ([a95dfec](https://github.com/tusharmath/qio/commit/a95dfec806f19a6057e7eacd0be5197192d8aef6))
* **qio:** update types for \`QIO.if\` ([31d5665](https://github.com/tusharmath/qio/commit/31d5665341ed0f8e27ac2720db6cc42dc09e2eb2))


### BREAKING CHANGES

* **fiber:** \`Fiber.await\` now returns an \`Exit\` status instead of a nested \`Option<Either>\`. This is done to
improve performane and simplify parsing.
* **managed:** Rename \`Managed.do\` to \`Managed.use_\`





## [28.1.3](https://github.com/tusharmath/qio/compare/v28.1.2...v28.1.3) (2019-12-19)


### Bug Fixes

* publish everything again on npm ([b864dee](https://github.com/tusharmath/qio/commit/b864deeb069fb8a1b6b33b4544844a6fcac6ec5d))
* **managed:** fix issue with the number of times a resource is acquired/released ([d42af76](https://github.com/tusharmath/qio/commit/d42af769bf723b83c4b168cccc98cff017d10ff6))





## [28.1.2](https://github.com/tusharmath/qio/compare/v28.1.1...v28.1.2) (2019-12-16)


### Bug Fixes

* **fs:** update types for fs.remove ([165a3f5](https://github.com/tusharmath/qio/commit/165a3f5d8c1dbbab4da4e56bac1b8e32c23bbe05))





## [28.1.1](https://github.com/tusharmath/qio/compare/v28.1.0...v28.1.1) (2019-12-16)


### Bug Fixes

* **managed:** remove \`par\` since we already have \`zip\` ([1b0e057](https://github.com/tusharmath/qio/commit/1b0e057056a4dee1a037184d97a24e53ae282c70))





# [28.1.0](https://github.com/tusharmath/qio/compare/v28.0.4...v28.1.0) (2019-12-08)


### Features

* **core:** add \`rejectWith\` operator ([80aac26](https://github.com/tusharmath/qio/commit/80aac263846fdb359f4e1546e1b7066f11840567))
* **managed:** add Managed.par ([73b7ba6](https://github.com/tusharmath/qio/commit/73b7ba687b15b592563018b5c7e7a74d405e51e5))





## [28.0.4](https://github.com/tusharmath/qio/compare/v28.0.3...v28.0.4) (2019-12-08)

**Note:** Version bump only for package qio





## [28.0.3](https://github.com/tusharmath/qio/compare/v28.0.2...v28.0.3) (2019-12-06)


### Bug Fixes

* add npm ignore file in all sub packages ([5ec6784](https://github.com/tusharmath/qio/commit/5ec6784f56f1257c940388cb1ec5d294c3f36914))
* **fsenv:** fix env implementation ([1ae3433](https://github.com/tusharmath/qio/commit/1ae3433806295f1687579d31042f13a90635d1bd))





## [28.0.2](https://github.com/tusharmath/qio/compare/v28.0.1...v28.0.2) (2019-12-05)


### Bug Fixes

* **queue:** rename variable ([7c3bd17](https://github.com/tusharmath/qio/commit/7c3bd17e5ec0617a252e0fb832b5fdf28f2e5aea))





## [28.0.1](https://github.com/tusharmath/qio/compare/v28.0.0...v28.0.1) (2019-12-04)

**Note:** Version bump only for package qio





# [28.0.0](https://github.com/tusharmath/qio/compare/v27.1.1...v28.0.0) (2019-12-04)


### Code Refactoring

* **qio:** fork signature updated ([ea00676](https://github.com/tusharmath/qio/commit/ea006763e1cc7e139b132c6b9ce89e076fe04865))


### BREAKING CHANGES

* **qio:** \`.fork\` is now a method \`.fork()\` instead of a property.





## [27.1.1](https://github.com/tusharmath/qio/compare/v27.1.0...v27.1.1) (2019-11-30)


### Bug Fixes

* **http:** handle cancellation via QIO.async API ([1d37e52](https://github.com/tusharmath/qio/commit/1d37e52a61bbd147a17ee4c4789b350ba1be6cec))





# [27.1.0](https://github.com/tusharmath/qio/compare/v27.0.5...v27.1.0) (2019-11-29)


### Features

* **qio:** added \`QIO.encaseM()\` and \`qio.encaseM()\` ([e4b32fc](https://github.com/tusharmath/qio/commit/e4b32fc866aa9260093a8fddc3c228c65b16e460))





## [27.0.5](https://github.com/tusharmath/qio/compare/v27.0.4...v27.0.5) (2019-11-25)

**Note:** Version bump only for package qio





## [27.0.4](https://github.com/tusharmath/qio/compare/v27.0.3...v27.0.4) (2019-11-25)


### Bug Fixes

* remove submodule dependency ([ca3ba03](https://github.com/tusharmath/qio/commit/ca3ba03616792e93414caeb5b095b9be8a31fb88))





## [27.0.3](https://github.com/tusharmath/qio/compare/v27.0.2...v27.0.3) (2019-11-25)


### Bug Fixes

* **dependency:** remove \`checked-exception\` as a dep ([b5200df](https://github.com/tusharmath/qio/commit/b5200df3ea52d3e2ef4cfd65a979d579b213b111))





## [27.0.2](https://github.com/tusharmath/qio/compare/v27.0.1...v27.0.2) (2019-11-25)


### Bug Fixes

* **package:** update dependencies ([726e815](https://github.com/tusharmath/qio/commit/726e815ba73af396712c209b458c214317df15b0))





## [27.0.1](https://github.com/tusharmath/qio/compare/v27.0.0...v27.0.1) (2019-11-25)


### Bug Fixes

* **package:** remove submodule import from TestRuntime ([c93312c](https://github.com/tusharmath/qio/commit/c93312c5b2403a8d0c37bdaa357899888c1389a7))





# [27.0.0](https://github.com/tusharmath/qio/compare/v26.0.5...v27.0.0) (2019-11-25)


### Bug Fixes

* **runtime:** remove nested import ([bde3c5d](https://github.com/tusharmath/qio/commit/bde3c5d64d604c55b2969411d32c6dd7e9655553))


### Code Refactoring

* **qio:** rename flattenM to tryM ([b5aa169](https://github.com/tusharmath/qio/commit/b5aa169d9042481d1369f37d343894858cd8edd4))


### BREAKING CHANGES

* **qio:** rename \`flattenM\` to \`tryM\`





## [26.0.5](https://github.com/tusharmath/qio/compare/v26.0.4...v26.0.5) (2019-11-23)

**Note:** Version bump only for package qio





## [26.0.4](https://github.com/tusharmath/qio/compare/v26.0.3...v26.0.4) (2019-11-22)

**Note:** Version bump only for package qio





## [26.0.3](https://github.com/tusharmath/qio/compare/v26.0.2...v26.0.3) (2019-11-22)

**Note:** Version bump only for package qio





## [26.0.2](https://github.com/tusharmath/qio/compare/v26.0.1...v26.0.2) (2019-11-22)

**Note:** Version bump only for package qio





## [26.0.1](https://github.com/tusharmath/qio/compare/v26.0.0...v26.0.1) (2019-11-21)

**Note:** Version bump only for package qio





# [26.0.0](https://github.com/tusharmath/qio/compare/v25.1.0...v26.0.0) (2019-11-21)


### Code Refactoring

* **testTTY:** update mocking signature ([8a83b7a](https://github.com/tusharmath/qio/commit/8a83b7a7902a3b01e2c0df76e3a8fef6b29270e6))


### BREAKING CHANGES

* **testTTY:** testTTY signature updated





# [25.1.0](https://github.com/tusharmath/qio/compare/v25.0.0...v25.1.0) (2019-11-21)


### Features

* **qio:** add \`QIO.lazy\` operator ([d39c3ce](https://github.com/tusharmath/qio/commit/d39c3ce59cf64799e44fc2481ed29360de34b74e))





# [25.0.0](https://github.com/tusharmath/qio/compare/v24.0.0...v25.0.0) (2019-11-19)


### Bug Fixes

* **stream:** update typings for mapM ([60372d2](https://github.com/tusharmath/qio/commit/60372d261afe334f44c8f0edcbbf65d299766554))


### Code Refactoring

* **fs:** use fs-extra instead of fs ([722bbe9](https://github.com/tusharmath/qio/commit/722bbe9f1d2f9de405331329bd2edaf45e733536))


### BREAKING CHANGES

* **fs:** \`@qio/fs\`  internally uses \`fs-extra\` instead of relying on the native node.js fs module





# [24.0.0](https://github.com/tusharmath/qio/compare/v23.0.0...v24.0.0) (2019-11-18)


### Bug Fixes

* **close:** handle errors on closing the file ([1f1223e](https://github.com/tusharmath/qio/commit/1f1223e8cae404b302bb864ae3346a86a4cb90e3))


### Code Refactoring

* **reservation:** change type signature ([e17c143](https://github.com/tusharmath/qio/commit/e17c14311e89fc92a16461423d4df174084045ce))


### BREAKING CHANGES

* **reservation:** Reservation.release can now throw exceptions





# [23.0.0](https://github.com/tusharmath/qio/compare/v22.0.5...v23.0.0) (2019-11-17)


### Code Refactoring

* **qio:** rename of() to resolve() ([edb0d14](https://github.com/tusharmath/qio/commit/edb0d148fdbe4115fe1f664e765403288d590aae))


### BREAKING CHANGES

* **qio:** renaming \`QIO.of()\` to \`QIO.resolve()\`





## [22.0.5](https://github.com/tusharmath/qio/compare/v22.0.4...v22.0.5) (2019-11-16)

**Note:** Version bump only for package qio





## [22.0.4](https://github.com/tusharmath/qio/compare/v22.0.3...v22.0.4) (2019-11-16)

**Note:** Version bump only for package qio





## [22.0.3](https://github.com/tusharmath/qio/compare/v22.0.2...v22.0.3) (2019-11-16)

**Note:** Version bump only for package qio





## [22.0.2](https://github.com/tusharmath/qio/compare/v22.0.1...v22.0.2) (2019-11-16)

**Note:** Version bump only for package qio





## [22.0.1](https://github.com/tusharmath/qio/compare/v22.0.0...v22.0.1) (2019-11-16)

**Note:** Version bump only for package qio

# [22.0.0](https://github.com/tusharmath/qio/compare/v21.2.1...v22.0.0) (2019-11-16)

### Bug Fixes

- update dependencies ([d511865](https://github.com/tusharmath/qio/commit/d511865178030c6fc09cef9f164d7d215bccb91c))

### Code Refactoring

- **env:** rename env from axios to http ([e60c72c](https://github.com/tusharmath/qio/commit/e60c72cc951450f3f13104095a1f841526ca6ee1))
- **qio:** change QIO.node signature ([a1bc4d8](https://github.com/tusharmath/qio/commit/a1bc4d89a7ddfc2fad79083248147ba76939f189))

### Features

- **package:** add @qio/fs ([0b995ae](https://github.com/tusharmath/qio/commit/0b995ae14fa7b147cab40f7c5bf78a60cef5d353))

### BREAKING CHANGES

- **qio:** QIO.node node returns a TUPLE of values.
- **env:** renaming \`IAxiosEnv\` to \`IHttpEnv\`

## [21.2.1](https://github.com/tusharmath/qio/compare/v21.2.0...v21.2.1) (2019-11-13)

### Bug Fixes

- **package:** add publish config ([a3b2e18](https://github.com/tusharmath/qio/commit/a3b2e1812357fe11cfdbc614c877d99a1fd7e115))

# [21.2.0](https://github.com/tusharmath/qio/compare/v21.1.3...v21.2.0) (2019-11-13)

### Features

- add http package ([b595baa](https://github.com/tusharmath/qio/commit/b595baa2c5448daa357ccb6d4a13f6a816fa7223))

## [21.1.3](https://github.com/tusharmath/qio/compare/v21.1.2...v21.1.3) (2019-11-07)

**Note:** Version bump only for package qio

## [21.1.2](https://github.com/tusharmath/qio/compare/v21.1.1...v21.1.2) (2019-11-07)

**Note:** Version bump only for package qio

## [21.1.1](https://github.com/tusharmath/qio/compare/v21.1.0...v21.1.1) (2019-11-07)

**Note:** Version bump only for package qio

# [21.1.0](https://github.com/tusharmath/qio/compare/v21.0.2...v21.1.0) (2019-11-07)

### Bug Fixes

- **package:** update dependencies ([e71f2ce](https://github.com/tusharmath/qio/commit/e71f2ced710a3790a7b898b1de895bb61b32a934))
- **package:** update dependencies ([486d8bb](https://github.com/tusharmath/qio/commit/486d8bb864e14ea9d9150ac5da5d79e0ed334600))

### Features

- create @qio/console ([95402f7](https://github.com/tusharmath/qio/commit/95402f71fbe57edbe0eb3ae2955d4fb79013fecb))

## [21.0.2](https://github.com/tusharmath/qio/compare/v21.0.1...v21.0.2) (2019-11-06)

**Note:** Version bump only for package qio

## [21.0.1](https://github.com/tusharmath/qio/compare/v21.0.0...v21.0.1) (2019-11-06)

**Note:** Version bump only for package qio

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

## [20.0.6](https://github.com/tusharmath/qio/compare/v20.0.5...v20.0.6) (2019-11-05)

**Note:** Version bump only for package qio

## [20.0.5](https://github.com/tusharmath/qio/compare/v20.0.4...v20.0.5) (2019-11-05)

**Note:** Version bump only for package qio

## [20.0.4](https://github.com/tusharmath/qio/compare/v20.0.3...v20.0.4) (2019-11-05)

### Bug Fixes

- **package:** add publish config ([64aa080](https://github.com/tusharmath/qio/commit/64aa080bd78dafdca44a38e38d428af015dc3539))

## [20.0.3](https://github.com/tusharmath/qio/compare/v20.0.2...v20.0.3) (2019-11-03)

### Bug Fixes

- **package:** publish prelude ([e60145b](https://github.com/tusharmath/qio/commit/e60145b9c03e70e080db4b049a355954dd7e64fb))

## [20.0.2](https://github.com/tusharmath/qio/compare/v20.0.1...v20.0.2) (2019-11-02)

**Note:** Version bump only for package qio

## [20.0.1](https://github.com/tusharmath/qio/compare/v20.0.0...v20.0.1) (2019-10-31)

**Note:** Version bump only for package qio

# [20.0.0](https://github.com/tusharmath/qio/compare/v19.0.2...v20.0.0) (2019-10-31)

### Code Refactoring

- **package:** create a new @qio/stream package ([eaa9f3d](https://github.com/tusharmath/qio/commit/eaa9f3d55db1176884c93da1ab3d1ec586ec0db9))
- **stream:** rename FStream to Stream ([9d99b9b](https://github.com/tusharmath/qio/commit/9d99b9b31a367e5ed0f1f141f5d9324bdb7c5199))

### BREAKING CHANGES

- **stream:** Renaming FStream to Stream
- **package:** FStream has been removed from @qio/core to @qio/stream

## [19.0.2](https://github.com/tusharmath/qio/compare/v19.0.1...v19.0.2) (2019-10-31)

**Note:** Version bump only for package qio

## [19.0.1](https://github.com/tusharmath/qio/compare/v19.0.0...v19.0.1) (2019-10-30)

**Note:** Version bump only for package qio

# [19.0.0](https://github.com/tusharmath/qio/compare/v18.0.7...v19.0.0) (2019-10-30)

### Bug Fixes

- **fiber:** handle cancellation callbacks while using await ([a74924d](https://github.com/tusharmath/qio/commit/a74924dff119d4f4041c2946c9d961a87436066a))

### BREAKING CHANGES

- **fiber:** remove \`Fiber.release\`

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

- **package:** remove **tests** from the package ([4466547](https://github.com/tusharmath/qio/commit/4466547ce1af82da98e4e21053b52cd02ae3cc43))
- **package:** test deploy script ([8bcb2f8](https://github.com/tusharmath/qio/commit/8bcb2f841612acd219aeaf8210a7bc6d380bb871))
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

**Note:** Version bump only for package qio

## [16.2.2](https://github.com/tusharmath/qio/compare/v16.2.1...v16.2.2) (2019-10-23)

### Bug Fixes

- **package:** update dependencies ([c17af47](https://github.com/tusharmath/qio/commit/c17af4797f4f67b270048df0656a42da88f25397))
- **package:** update lock file ([4e24a3b](https://github.com/tusharmath/qio/commit/4e24a3b4bd183c40036f7f0c8e8ea6f3ceffd845))
