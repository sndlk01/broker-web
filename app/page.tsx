"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { clearAuthToken, getAuthToken } from "@/lib/client-auth";
import type { Broker, BrokerType } from "@/lib/types";

const brokerTypes: Array<BrokerType | "all"> = [
  "all",
  "cfd",
  "bond",
  "stock",
  "crypto",
];
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030/api/web";

function SearchIcon() {
  return (
    <Box as="svg" viewBox="0 0 24 24" aria-hidden="true" boxSize="4">
      <path
        d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Box>
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
      <Box
        as="img"
        src={broker.logo_url}
        alt={`${broker.name} logo`}
        w="full"
        h="full"
        objectFit="cover"
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

export default function BrokerListPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [query, setQuery] = useState("");
  const [brokerType, setBrokerType] = useState<BrokerType | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      params.set("search", trimmedQuery);
    }

    if (brokerType !== "all") {
      params.set("type", brokerType);
    }

    const queryString = params.toString();

    return queryString
      ? `${apiBaseUrl}/brokers?${queryString}`
      : `${apiBaseUrl}/brokers`;
  }, [brokerType, query]);

  useEffect(() => {
    let cancelled = false;

    async function loadBrokers() {
      setLoading(true);
      setError("");

      try {
        const token = getAuthToken();
        const response = await fetch(requestUrl, {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthToken();
            router.push("/login");
          }

          throw new Error(data.message ?? "Unable to load brokers.");
        }

        if (!cancelled) {
          setBrokers(data.data ?? data.brokers ?? data);
        }
      } catch (loadError) {
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
  }, [requestUrl, router]);

  return (
    <AppShell>
      <VStack align="stretch" gap="10">
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

        <VStack align="stretch" maxW="820px" gap="5">
          <Flex
            as="label"
            h="14"
            align="center"
            gap="4"
            rounded="md"
            bg="#0b1a2f"
            px="5"
            color="#8da0bf"
            border="1px solid rgba(255,255,255,0.03)"
          >
            <SearchIcon />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search broker by name..."
              variant="plain"
              p="0"
              color="#c6d5ee"
              _placeholder={{ color: "#56677f" }}
            />
          </Flex>

          <HStack flexWrap="wrap" gap="3">
            <Text
              mr="2"
              color="#62728a"
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.22em"
              textTransform="uppercase"
            >
              Broker Type:
            </Text>
            {brokerTypes.map((type) => (
              <Button
                key={type}
                h="10"
                rounded="lg"
                bg={brokerType === type ? "#b8cffb" : "#12233a"}
                px="5"
                color={brokerType === type ? "#10213a" : "#9eacc4"}
                fontSize="12px"
                fontWeight="600"
                textTransform="uppercase"
                onClick={() => setBrokerType(type)}
                _hover={{
                  bg: brokerType === type ? "#c8dbff" : "#1a2d49",
                  color: brokerType === type ? "#10213a" : "white",
                }}
              >
                {type}
              </Button>
            ))}
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
                    <Link href={`/broker/${broker.slug}`} _hover={{ color: "#b8cffb" }}>
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
