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
        <Toast.Root
          key={toast.id}
          display="flex"
          alignItems="flex-start"
          gap="3"
          w={{ base: "calc(100vw - 32px)", sm: "380px" }}
          maxW="380px"
          minH="auto"
          rounded="md"
          bg="#0f1f35"
          border="1px solid #1f3b5e"
          color="#d7e2fb"
          boxShadow="0 18px 45px rgba(0, 0, 0, 0.35)"
          px="4"
          py="3"
        >
          <Toast.Indicator flexShrink={0} mt="0.5" color="#68d391" />
          <Box flex="1" minW="0">
            <Toast.Title fontSize="14px" fontWeight="700" lineHeight="1.3">
              {toast.title as string}
            </Toast.Title>
            {toast.description ? (
              <Toast.Description
                mt="1"
                color="#9fb0c8"
                fontSize="13px"
                lineHeight="1.45"
              >
                {toast.description as string}
              </Toast.Description>
            ) : null}
          </Box>
          <Toast.CloseTrigger
            flexShrink={0}
            color="#6f829d"
            _hover={{ color: "#d7e2fb" }}
          />
        </Toast.Root>
      )}
    </Toaster>
  );
}
