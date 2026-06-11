"use client";

import {
  Box,
  createToaster,
  Toast,
  Toaster,
} from "@chakra-ui/react";

export const toaster = createToaster({ placement: "bottom-end" });

export function ToastContainer() {
  return (
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root key={toast.id}>
          <Toast.Indicator />
          <Box flex="1">
            <Toast.Title>{toast.title as string}</Toast.Title>
            {toast.description ? (
              <Toast.Description>{toast.description as string}</Toast.Description>
            ) : null}
          </Box>
          <Toast.CloseTrigger />
        </Toast.Root>
      )}
    </Toaster>
  );
}
