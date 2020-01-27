# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [0.0.13] - 2020-01-27

### Added

- [#30](https://github.com/cosmos/lunie/issues/30) Storing network value in wallet @iambeone

## [0.0.12] - 2019-12-17

### Added

- Use any bech32 prefix to create accounts @Bitcoinera

### Repository

- Remove all languages for bip39 wordlists but english to reduce the size of the bundle @colw

## [0.0.11] - 2019-10-07

### Added

- Made library node compatible @AlexBHarley @faboweb

## [0.0.10] - 2019-06-19

### Added

- Added a mechanism to store keys in local storage @faboweb

### Fixed

- Key creation would create sometimes keys of wrong length @faboweb

### Repository

- Made the repository CI ready @faboweb

## [0.0.9] - 2019-06-02

### Added

- accept strings as signmessage @faboweb

## [0.0.8] - 2019-06-02

### Fixed

- Typo in bundle name caused issues with integration @faboweb

## [0.0.7] - 2019-06-02

### Fixed

- Release didn't include correct files @faboweb
- Fixed publishing wrong files @faboweb

### Repository

- Changed license to Apache-2 @faboweb

## [0.0.6] - 2019-06-01

### Repository

- Switched to webpack from rollup to simplify repository @faboweb

## [0.0.5] - 2019-05-24

### Deprecated

- Removed some data structure relevant code from this library to make it signing only @faboweb

## [0.0.4] - 2019-04-14

### Added

- Added changelog @faboweb

### Changed

- Slightly improved API (breaking) @faboweb
- Slimmed repository architecture @faboweb

### Fixed

- Fixed tests @faboweb