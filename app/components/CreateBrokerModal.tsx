"use client";

import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { FormEvent, useRef, useState } from "react";
import { ApiError, createBroker, updateBroker } from "@/lib/api";
import { clearAuthToken, getAuthToken } from "@/lib/client-auth";
import { toaster } from "@/lib/toaster";
import type { Broker, BrokerPayload, BrokerType } from "@/lib/types";
import { useRouter } from "next/navigation";

const brokerTypes: BrokerType[] = ["cfd", "bond", "stock", "crypto"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (broker: Broker) => void;
  broker?: Broker | null;
}

export function CreateBrokerModal({ open, onClose, onSaved, broker }: Props) {
  const router = useRouter();
  const isEditing = Boolean(broker);
  const [name, setName] = useState(broker?.name ?? "");
  const [slug, setSlug] = useState(broker?.slug ?? "");
  const [description, setDescription] = useState(broker?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(broker?.logo_url ?? "");
  const [website, setWebsite] = useState(broker?.website ?? "");
  const [brokerType, setBrokerType] = useState<BrokerType>(
    broker?.broker_type ?? "cfd",
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const slugEditedRef = useRef(Boolean(broker));

  function reset() {
    setName("");
    setSlug("");
    setDescription("");
    setLogoUrl("");
    setWebsite("");
    setBrokerType("cfd");
    setMessage("");
    slugEditedRef.current = false;
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEditedRef.current) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    slugEditedRef.current = value !== slugify(name);
    setSlug(value);
  }

  async function submitBroker(event: FormEvent) {
    event.preventDefault();

    const token = getAuthToken();
    if (!token) {
      onClose();
      router.push("/login?next=/");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const payload: BrokerPayload = {
        name,
        slug,
        description,
        logo_url: logoUrl,
        website,
        broker_type: brokerType,
      };
      const savedBroker = broker
        ? await updateBroker(broker.id, payload, { token })
        : await createBroker(payload, { token });

      toaster.create({
        title: isEditing ? "Broker updated" : "Broker created",
        description: isEditing
          ? `"${name}" has been updated.`
          : `"${name}" has been added to the directory.`,
        type: "success",
        duration: 3000,
      });

      reset();
      onClose();
      onSaved(savedBroker);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthToken();
        onClose();
        router.push("/login?next=/");
        return;
      }
      setMessage(
        error instanceof Error
          ? error.message
          : `Unable to ${isEditing ? "update" : "create"} broker.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        if (!e.open) handleClose();
      }}
      lazyMount
      unmountOnExit
    >
      <DialogBackdrop bg="rgba(4, 12, 24, 0.75)" backdropFilter="blur(4px)" />
      <DialogPositioner>
        <DialogContent
          bg="#0a1929"
          border="1px solid #1a2f4a"
          rounded="xl"
          maxW="580px"
          w="full"
          mx="4"
          boxShadow="0 32px 80px rgba(0,0,0,0.5)"
          maxH="90dvh"
          overflowY="auto"
        >
          <DialogHeader borderBottom="1px solid #0f2238" px="7" py="5">
            <DialogTitle
              fontFamily="Georgia, serif"
              fontSize="22px"
              color="#d8e3f7"
              letterSpacing="-0.02em"
            >
              {isEditing ? "Edit Broker" : "Create Broker"}
            </DialogTitle>
            <DialogCloseTrigger
              color="#4a6280"
              _hover={{ color: "#8da0bf", bg: "#0f2035" }}
              rounded="md"
            />
          </DialogHeader>

          <DialogBody px="7" py="6">
            <VStack as="form" align="stretch" gap="5" onSubmit={submitBroker}>
              <FieldRow label="Name">
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  bg="#071320"
                  borderColor="#1a2f4a"
                  color="#d7e2fb"
                  _focus={{ borderColor: "#3a5a8a" }}
                  required
                />
              </FieldRow>

              <FieldRow label="Slug">
                <Input
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="example-broker"
                  bg="#071320"
                  borderColor="#1a2f4a"
                  color="#d7e2fb"
                  _focus={{ borderColor: "#3a5a8a" }}
                  required
                />
              </FieldRow>

              <FieldRow label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  bg="#071320"
                  borderColor="#1a2f4a"
                  color="#d7e2fb"
                  _focus={{ borderColor: "#3a5a8a" }}
                  minH="100px"
                  required
                />
              </FieldRow>

              <FieldRow label="Logo URL">
                <Input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  bg="#071320"
                  borderColor="#1a2f4a"
                  color="#d7e2fb"
                  _focus={{ borderColor: "#3a5a8a" }}
                  required
                />
              </FieldRow>

              <FieldRow label="Website">
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  bg="#071320"
                  borderColor="#1a2f4a"
                  color="#d7e2fb"
                  _focus={{ borderColor: "#3a5a8a" }}
                  required
                />
              </FieldRow>

              <FieldRow label="Broker type">
                <select
                  value={brokerType}
                  onChange={(e) => setBrokerType(e.target.value as BrokerType)}
                  required
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "6px",
                    background: "#071320",
                    border: "1px solid #1a2f4a",
                    color: "#d7e2fb",
                    padding: "0 12px",
                    fontSize: "14px",
                  }}
                >
                  {brokerTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </FieldRow>

              {message ? (
                <Text color="#ffb7c5" fontSize="13px">
                  {message}
                </Text>
              ) : null}

              <Box pt="2" display="flex" gap="3" justifyContent="flex-end">
                <Button
                  type="button"
                  variant="ghost"
                  color="#4a6280"
                  _hover={{ bg: "#0f2035", color: "#8da0bf" }}
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  bg="#aac8fb"
                  color="#10213a"
                  _hover={{ bg: "white" }}
                  px="6"
                >
                  {isEditing ? "Save Changes" : "Submit"}
                </Button>
              </Box>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Text
        mb="2"
        color="#7a96b8"
        fontSize="12px"
        fontWeight="700"
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}
