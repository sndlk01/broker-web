"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { CreateBrokerModal } from "../components/CreateBrokerModal";
import { DeleteBrokerDialog } from "../components/DeleteBrokerDialog";
import { ApiError, deleteBroker, listBrokers } from "@/lib/api";
import { clearAuthToken, getAuthToken } from "@/lib/client-auth";
import { toaster } from "@/lib/toaster";
import type { Broker } from "@/lib/types";

export default function ManageBrokersPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [brokerToDelete, setBrokerToDelete] = useState<Broker | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadBrokers() {
      const token = getAuthToken();

      if (!token) {
        router.push("/login?next=/manage");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const brokerList = await listBrokers({ token });

        if (!cancelled) {
          setBrokers(brokerList);
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          clearAuthToken();
          router.push("/login?next=/manage");
          return;
        }

        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load brokers.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBrokers();

    return () => {
      cancelled = true;
    };
  }, [router, refreshTick]);

  function openCreateBrokerModal() {
    setEditingBroker(null);
    setIsBrokerModalOpen(true);
  }

  function openEditBrokerModal(broker: Broker) {
    setEditingBroker(broker);
    setIsBrokerModalOpen(true);
  }

  function closeBrokerModal() {
    setIsBrokerModalOpen(false);
    setEditingBroker(null);
  }

  function handleBrokerSaved() {
    setRefreshTick((tick) => tick + 1);
  }

  function closeDeleteDialog() {
    if (deleteSubmitting) return;
    setBrokerToDelete(null);
    setDeleteMessage("");
  }

  async function confirmDeleteBroker() {
    if (!brokerToDelete) return;

    const token = getAuthToken();
    if (!token) {
      setBrokerToDelete(null);
      router.push("/login?next=/manage");
      return;
    }

    setDeleteSubmitting(true);
    setDeleteMessage("");

    try {
      await deleteBroker(brokerToDelete.id, { token });

      toaster.create({
        title: "Broker deleted",
        description: `"${brokerToDelete.name}" has been removed.`,
        type: "success",
        duration: 3000,
      });

      setBrokers((currentBrokers) =>
        currentBrokers.filter(
          (broker) => String(broker.id) !== String(brokerToDelete.id),
        ),
      );
      setBrokerToDelete(null);
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 401) {
        clearAuthToken();
        setBrokerToDelete(null);
        router.push("/login?next=/manage");
        return;
      }

      setDeleteMessage(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete broker.",
      );
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <AppShell>
      <CreateBrokerModal
        key={`${editingBroker?.id ?? "create"}-${isBrokerModalOpen ? "open" : "closed"}`}
        open={isBrokerModalOpen}
        broker={editingBroker}
        onClose={closeBrokerModal}
        onSaved={handleBrokerSaved}
      />
      <DeleteBrokerDialog
        broker={brokerToDelete}
        open={Boolean(brokerToDelete)}
        submitting={deleteSubmitting}
        message={deleteMessage}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteBroker}
      />

      <VStack align="stretch" gap="8" w="full">
        <Flex align="flex-start" justify="space-between" gap="5" wrap="wrap">
          <Box>
            <Heading
              as="h1"
              fontFamily="Georgia, serif"
              fontSize={{ base: "38px", md: "52px" }}
              letterSpacing="-0.03em"
              color="#d7e2fb"
            >
              Manage Brokers
            </Heading>
            <Text mt="3" color="#8696ad" lineHeight="1.7">
              Create, edit, and delete broker records from one protected list.
            </Text>
          </Box>
          <Button
            mt={{ base: "0", md: "2" }}
            bg="#aac8fb"
            color="#10213a"
            fontWeight="700"
            fontSize="13px"
            px="5"
            h="10"
            rounded="lg"
            _hover={{ bg: "white" }}
            onClick={openCreateBrokerModal}
          >
            + Create Broker
          </Button>
        </Flex>

        {loading ? (
          <Flex minH="260px" align="center" justify="center">
            <Spinner color="#b8cffb" />
          </Flex>
        ) : error ? (
          <Box rounded="md" bg="#241324" p="5" color="#ffb7c5">
            {error}
          </Box>
        ) : brokers.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            minH="280px"
            gap="4"
            rounded="md"
            border="1px dashed #1e3454"
            color="#7889a4"
          >
            <Text fontWeight="700">No brokers yet</Text>
            <Button
              bg="#aac8fb"
              color="#10213a"
              _hover={{ bg: "white" }}
              onClick={openCreateBrokerModal}
            >
              Create Broker
            </Button>
          </Flex>
        ) : (
          <VStack align="stretch" gap="3">
            <Grid
              display={{ base: "none", md: "grid" }}
              templateColumns="96px 1.2fr 1fr 110px 190px"
              gap="4"
              px="5"
              color="#536780"
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              <Text>ID</Text>
              <Text>Name</Text>
              <Text>Slug</Text>
              <Text>Type</Text>
              <Text textAlign="right">Actions</Text>
            </Grid>

            {brokers.map((broker) => (
              <Grid
                key={broker.id}
                templateColumns={{
                  base: "1fr",
                  md: "96px 1.2fr 1fr 110px 190px",
                }}
                gap={{ base: "4", md: "4" }}
                alignItems="center"
                rounded="md"
                bg="#0f1f35"
                border="1px solid rgba(255,255,255,0.05)"
                p="5"
              >
                <Text color="#71839d" fontSize="12px">
                  #{broker.id}
                </Text>
                <Box minW="0">
                  <Link
                    href={`/broker/${broker.slug}`}
                    color="#d8e3f7"
                    fontWeight="700"
                    _hover={{ color: "#b8cffb" }}
                  >
                    {broker.name}
                  </Link>
                  <Text
                    display={{ base: "block", md: "none" }}
                    mt="1"
                    color="#71839d"
                    fontSize="12px"
                    wordBreak="break-word"
                  >
                    {broker.slug}
                  </Text>
                </Box>
                <Text
                  display={{ base: "none", md: "block" }}
                  color="#8292aa"
                  fontSize="13px"
                  wordBreak="break-word"
                >
                  {broker.slug}
                </Text>
                <Badge
                  justifySelf={{ base: "flex-start", md: "start" }}
                  rounded="full"
                  bg="rgba(155,185,238,0.85)"
                  px="3"
                  py="1"
                  color="white"
                  fontSize="10px"
                  textTransform="uppercase"
                >
                  {broker.broker_type}
                </Badge>
                <HStack
                  justify={{ base: "flex-start", md: "flex-end" }}
                  gap="2"
                >
                  <Button
                    h="8"
                    px="3"
                    bg="#152c49"
                    color="#b9d0fb"
                    fontSize="12px"
                    _hover={{ bg: "#1e3d6b", color: "white" }}
                    onClick={() => openEditBrokerModal(broker)}
                  >
                    Edit
                  </Button>
                  <Button
                    h="8"
                    px="3"
                    bg="#2a1420"
                    color="#ffb7c5"
                    fontSize="12px"
                    _hover={{ bg: "#3a1927", color: "#ffd4dd" }}
                    onClick={() => {
                      setDeleteMessage("");
                      setBrokerToDelete(broker);
                    }}
                  >
                    Delete
                  </Button>
                </HStack>
              </Grid>
            ))}
          </VStack>
        )}
      </VStack>
    </AppShell>
  );
}
