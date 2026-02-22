import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL needs an explicit afterEach(cleanup) when Vitest runs without globals:true,
// because the automatic cleanup hook relies on a global `afterEach` being present.
afterEach(cleanup);
