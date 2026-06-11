"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { clearAuthToken, getAuthToken } from "@/lib/client-auth";
import type { Broker } from "@/lib/types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030/api/web";

export default function BrokerDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBroker() {
      setLoading(true);
      setError("");

      try {
        const token = getAuthToken();
        const response = await fetch(`${apiBaseUrl}/brokers/${params.slug}`, {
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

          throw new Error(data.message ?? "Unable to load broker.");
        }

        if (!cancelled) {
          setBroker(data.data ?? data.broker ?? data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load broker.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBroker();

    return () => {
      cancelled = true;
    };
  }, [params.slug, router]);

  return (
    <AppShell>
      {loading ? (
        <Flex minH="360px" align="center" justify="center">
          <Spinner color="#b8cffb" />
        </Flex>
      ) : error ? (
        <VStack align="flex-start" gap="5" rounded="md" bg="#241324" p="7">
          <Text color="#ffb7c5">{error}</Text>
          <Button onClick={() => router.push("/")} bg="#aac8fb" color="#10213a">
            Back to Broker List
          </Button>
        </VStack>
      ) : broker ? (
        <Grid templateColumns={{ base: "1fr", lg: "0.95fr 1.05fr" }} gap="8">
          <Box
            minH="420px"
            rounded="md"
            overflow="hidden"
            position="relative"
            bg="#0f1f35"
          >
            {broker.logo_url ? (
              <Box
                as="img"
                src={broker.logo_url}
                alt={`${broker.name} logo`}
                w="full"
                h="full"
                minH="420px"
                objectFit="cover"
                filter="grayscale(1)"
              />
            ) : (
              <Box className="broker-image broker-image-building" aria-hidden="true">
                <Box className="image-vignette" />
              </Box>
            )}
            <Box
              position="absolute"
              inset="0"
              bg="linear-gradient(180deg, rgba(7, 20, 38, 0.04), rgba(7, 20, 38, 0.68))"
              pointerEvents="none"
            />
          </Box>

          <Box rounded="md" bg="#0f1f35" p={{ base: "6", md: "8" }}>
            <Badge
              rounded="full"
              bg="rgba(155,185,238,0.85)"
              px="3"
              py="1"
              color="white"
              textTransform="uppercase"
            >
              {broker.broker_type}
            </Badge>
            <Heading
              as="h1"
              mt="5"
              fontFamily="Georgia, serif"
              fontSize={{ base: "40px", md: "56px" }}
              letterSpacing="-0.035em"
              color="#d8e3f7"
            >
              {broker.name}
            </Heading>
            <Text mt="5" color="#8292aa" lineHeight="1.8">
              {broker.description}
            </Text>

            <VStack mt="8" align="stretch" gap="4">
              <DetailRow label="ID" value={broker.id} />
              <DetailRow label="Slug" value={broker.slug} />
              <DetailRow label="Logo URL" value={broker.logo_url} />
              <DetailRow label="Website" value={broker.website} isLink />
              <DetailRow label="Broker Type" value={broker.broker_type} />
            </VStack>

            <Button
              mt="8"
              bg="#aac8fb"
              color="#10213a"
              _hover={{ bg: "white" }}
              onClick={() => router.push("/")}
            >
              Back to Broker List
            </Button>
          </Box>
        </Grid>
      ) : null}
    </AppShell>
  );
}

function DetailRow({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "160px 1fr" }}
      gap="2"
      borderTop="1px solid #203752"
      pt="4"
    >
      <Text color="#71839d" fontSize="12px" fontWeight="700" textTransform="uppercase">
        {label}
      </Text>
      {isLink ? (
        <Link href={value} color="#b9d0fb" wordBreak="break-word">
          {value}
        </Link>
      ) : (
        <Text color="#d7e2fb" wordBreak="break-word">
          {value}
        </Text>
      )}
    </Grid>
  );
}
