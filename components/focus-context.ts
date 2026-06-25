"use client";

import { createContext, useContext } from "react";

/** True when the UI chrome (controls, header, switcher) is currently hidden. */
export const ChromeHiddenContext = createContext(false);

export const useChromeHidden = (): boolean => useContext(ChromeHiddenContext);
