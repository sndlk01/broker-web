"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { ApiError, listBrokers } from "@/lib/api";
import { clearAuthToken, getAuthToken } from "@/lib/client-auth";
import type { Broker, BrokerType } from "@/lib/types";

const editableBrokerTypes: BrokerType[] = ["cfd", "bond", "stock", "crypto"];
const brokerTypes: Array<BrokerType | "all"> = [
  "all",
  ...editableBrokerTypes,
];

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      width="16"
      height="16"
    >
      <path
        d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function BrokerArtwork({
  broker,
  index,
}: {
  broker: Broker;
  index: number;
}) {
  const imageNames = ["building", "corridor", "stairs", "network", "atrium"];
  const image = imageNames[index % imageNames.length];

  if (broker.logo_url) {
    return (
      <Image
        src={broker.logo_url}
        alt={`${broker.name} logo`}
        w="full"
        h="full"
        fit="cover"
        filter="grayscale(1)"
      />
    );
  }

  return (
    <Box className={`broker-image broker-image-${image}`} aria-hidden="true">
      <Box className="image-vignette" />
    </Box>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="320px"
      gap="5"
      rounded="md"
      border="1px dashed #1e3454"
      color="#536780"
    >
      <svg
        viewBox="0 0 24 24"
        width="40"
        height="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.4 }}
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
      <Box textAlign="center">
        <Text fontWeight="600" color="#7889a4" mb="1">
          {hasFilters ? "No brokers match your search" : "No brokers yet"}
        </Text>
        <Text fontSize="13px">
          {hasFilters
            ? "Try adjusting your search or filter."
            : "Create the first broker record to get started."}
        </Text>
      </Box>
      {hasFilters ? (
        <Button
          size="sm"
          bg="#12233a"
          color="#9eacc4"
          _hover={{ bg: "#1a2d49", color: "white" }}
          onClick={onClear}
        >
          Clear filters
        </Button>
      ) : (
        <Text fontSize="13px" color="#7889a4">
          Broker records will appear here once they are published.
        </Text>
      )}
    </Flex>
  );
}

export default function BrokerListPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [brokerType, setBrokerType] = useState<BrokerType | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read initial search/filter from URL after hydration.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const search = params.get("search") ?? "";
      const type = params.get("type");

      if (search) {
        setQuery(search);
        setDebouncedQuery(search);
      }

      if (editableBrokerTypes.includes(type as BrokerType)) {
        setBrokerType(type as BrokerType);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Debounce query → debouncedQuery
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Sync search/filter state to URL (skip first render before init)
  const isFirstSyncRef = useRef(true);
  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("search", debouncedQuery);
    if (brokerType !== "all") params.set("type", brokerType);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [debouncedQuery, brokerType, router]);

  // Fetch brokers
  useEffect(() => {
    let cancelled = false;

    async function loadBrokers() {
      setLoading(true);
      setError("");

      try {
        const token = getAuthToken();
        const brokerList = await listBrokers({
          search: debouncedQuery,
          type: brokerType,
          token,
        });

        if (!cancelled) {
          setBrokers(brokerList);
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          clearAuthToken();
          router.push("/login");
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
  }, [brokerType, debouncedQuery, router]);

  function clearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setBrokerType("all");
  }

  const hasFilters = debouncedQuery !== "" || brokerType !== "all";

  return (
    <AppShell>
      <VStack align="stretch" gap="10">
        <Flex align="flex-start" justify="space-between" gap="6" wrap="wrap">
          <Box>
            <Heading
              as="h1"
              fontFamily="Georgia, serif"
              fontSize={{ base: "44px", md: "64px" }}
              letterSpacing="-0.035em"
              color="#d7e2fb"
            >
              Institutional Brokers
            </Heading>
            <Text mt="4" maxW="680px" color="#8696ad" lineHeight="1.8">
              Search, filter, and open broker records from the curated provider
              directory.
            </Text>
          </Box>
        </Flex>

        <VStack align="stretch" maxW="820px" gap="4">
          <Box
            position="relative"
            rounded="xl"
            bg="#0b1928"
            border="1px solid #1a2f4a"
            _focusWithin={{ border: "1px solid #3a5a8a", boxShadow: "0 0 0 3px rgba(100,160,255,0.08)" }}
            transition="box-shadow 0.15s, border-color 0.15s"
          >
            <Flex align="center" h="14" px="5" gap="3">
              <Box color="#3d5a7a" flexShrink={0}>
                <SearchIcon />
              </Box>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search broker by name..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#c6d5ee",
                  fontSize: "14px",
                  caretColor: "#7ab0f5",
                }}
                className="broker-search-input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  style={{
                    flexShrink: 0,
                    background: "transparent",
                    border: "none",
                    color: "#3d5573",
                    fontSize: "20px",
                    lineHeight: 1,
                    cursor: "pointer",
                    padding: "2px 4px",
                  }}
                >
                  ×
                </button>
              )}
            </Flex>
          </Box>

          <HStack flexWrap="wrap" gap="2" pt="1">
            {brokerTypes.map((type) => {
              const active = brokerType === type;
              return (
                <Button
                  key={type}
                  onClick={() => setBrokerType(type)}
                  h="8"
                  px="4"
                  rounded="full"
                  bg={active ? "#1e3d6b" : "transparent"}
                  color={active ? "#a8caff" : "#4a6280"}
                  fontSize="11px"
                  fontWeight="700"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  border={active ? "1px solid #2e5490" : "1px solid #1a2f4a"}
                  transition="all 0.12s"
                  _hover={{
                    bg: active ? "#234776" : "#0f1f35",
                    color: active ? "#c5daff" : "#8da0bf",
                    borderColor: active ? "#3a5f9a" : "#253d5c",
                  }}
                >
                  {type}
                </Button>
              );
            })}
          </HStack>
        </VStack>

        {loading ? (
          <Flex minH="260px" align="center" justify="center">
            <Spinner color="#b8cffb" />
          </Flex>
        ) : error ? (
          <Box rounded="md" bg="#241324" p="5" color="#ffb7c5">
            {error}
          </Box>
        ) : brokers.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <Grid
            gap="8"
            templateColumns={{
              base: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            }}
          >
            {brokers.map((broker, index) => (
              <Box
                as="article"
                key={broker.id}
                overflow="hidden"
                rounded="md"
                bg="#0f1f35"
                boxShadow="0 24px 70px rgba(0,0,0,0.18)"
                border="1px solid rgba(255,255,255,0.04)"
              >
                <Box position="relative" h="56">
                  <BrokerArtwork broker={broker} index={index} />
                  <Box
                    position="absolute"
                    inset="0"
                    bg="linear-gradient(180deg, rgba(7, 20, 38, 0.04), rgba(7, 20, 38, 0.68))"
                    pointerEvents="none"
                  />
                  <Badge
                    position="absolute"
                    top="4"
                    right="4"
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
                </Box>
                <Box p="7">
                  <Heading
                    as="h2"
                    fontFamily="Georgia, serif"
                    fontSize="24px"
                    color="#d8e3f7"
                  >
                    <Link href={`/broker/${broker.slug}`} color="inherit" _hover={{ color: "#b8cffb" }}>
                      {broker.name}
                    </Link>
                  </Heading>
                  <Text mt="3" minH="72px" color="#8292aa" fontSize="13px" lineHeight="1.7">
                    {broker.description}
                  </Text>
                  <Flex mt="7" align="center" justify="space-between" gap="4">
                    <Text color="#71839d" fontSize="10px" textTransform="uppercase">
                      {broker.slug}
                    </Text>
                    <Link
                      href={`/broker/${broker.slug}`}
                      color="#b9d0fb"
                      fontSize="12px"
                      fontWeight="700"
                      _hover={{ color: "white" }}
                    >
                      View Details
                    </Link>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>
    </AppShell>
  );
}
