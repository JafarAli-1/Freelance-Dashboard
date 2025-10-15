"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { PropsWithChildren } from "react";

const theme = createTheme({
  primaryColor: "indigo",
});

export function Providers({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
