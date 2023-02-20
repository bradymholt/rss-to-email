import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  resolver: "ts-jest-resolver",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],  
  transform: {
    "^.+\\.(ts|tsx)?$": [
      "ts-jest",
      {
        useESM: true,
        diagnostics: {
          ignoreCodes: ["TS151001"],
        },

        tsconfig: "./test/tsconfig.json",
      },
    ],
  },
};
export default config;
