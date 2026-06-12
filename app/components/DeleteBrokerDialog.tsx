"use client";

import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Text,
} from "@chakra-ui/react";
import type { Broker } from "@/lib/types";

interface Props {
  broker: Broker | null;
  open: boolean;
  submitting: boolean;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteBrokerDialog({
  broker,
  open,
  submitting,
  message,
  onClose,
  onConfirm,
}: Props) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      lazyMount
      unmountOnExit
    >
      <DialogBackdrop bg="rgba(4, 12, 24, 0.75)" backdropFilter="blur(4px)" />
      <DialogPositioner>
        <DialogContent
          bg="#0a1929"
          border="1px solid #382033"
          rounded="xl"
          maxW="460px"
          w="full"
          mx="4"
          boxShadow="0 32px 80px rgba(0,0,0,0.5)"
        >
          <DialogHeader borderBottom="1px solid #1f1726" px="7" py="5">
            <DialogTitle color="#ffd4dd" fontSize="20px">
              Delete Broker
            </DialogTitle>
            <DialogCloseTrigger
              color="#7f5663"
              _hover={{ color: "#ffd4dd", bg: "#1a0d18" }}
              rounded="md"
            />
          </DialogHeader>

          <DialogBody px="7" py="6">
            <Text color="#d7e2fb" lineHeight="1.7">
              Are you sure you want to delete{" "}
              <Box as="span" fontWeight="700" color="#ffffff">
                {broker?.name ?? "this broker"}
              </Box>
              ? This action cannot be undone.
            </Text>
            {message ? (
              <Text mt="4" color="#ffb7c5" fontSize="13px">
                {message}
              </Text>
            ) : null}
          </DialogBody>

          <DialogFooter px="7" pb="6" gap="3">
            <Button
              type="button"
              variant="ghost"
              color="#7d8da5"
              _hover={{ bg: "#0f2035", color: "#d7e2fb" }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              bg="#ffb7c5"
              color="#1c0d14"
              _hover={{ bg: "#ffd4dd" }}
              loading={submitting}
              onClick={onConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
