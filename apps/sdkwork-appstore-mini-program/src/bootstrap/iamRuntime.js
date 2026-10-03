/**
 * Session module shim.
 *
 * The canonical session implementation lives inside the runtime bundle
 * (`src/bootstrap/runtime.ts`) so the thin pages and the bundled page loaders
 * share exactly one session instance. Re-exporting here keeps the historical
 * `require("../../bootstrap/iamRuntime")` page path stable.
 */
module.exports = require("../runtime/appstore-app");
