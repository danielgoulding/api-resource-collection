# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2020-01-17

### Added

- The ability to transform response before sending back data - so you can choose what gets retorned in the payload to the reducer. This enables header data as well as body data to be used.
- The ability to set item data for API based resource. It is now possible to manually set what would normally be fetched over the network. This is useful for situations where you might want to simply use data held in local storage rather than make an API request
- The ability to clear item data (revert back to original reducer state). This is useful if you want to force a new API request to get fresh data.
