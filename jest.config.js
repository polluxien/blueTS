
/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: ["**/src/test-jest/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.vscode-test/"],
};
