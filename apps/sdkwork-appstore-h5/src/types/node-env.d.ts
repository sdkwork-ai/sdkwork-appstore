/**
 * Browser-side ambient type additions.
 *
 * The shared IAM H5 auth components (`@sdkwork/iam-h5-auth`) annotate timer
 * handles with the `NodeJS` namespace; this browser tsconfig deliberately does
 * not load `@types/node`, so declare the browser-equivalent subset instead of
 * pulling Node typings into client code.
 */
declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
}
