import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

describe("App", () => {
  it("renders header text", () => {
    render(<App />);
    expect(screen.getByText(/Trigger n8n pipeline/i)).toBeDefined();
  });
});
