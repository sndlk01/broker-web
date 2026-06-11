"use client";

import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { clearAuthToken, getAuthToken } from "@/lib/client-auth";
import type { BrokerType } from "@/lib/types";

const brokerTypes: BrokerType[] = ["cfd", "bond", "stock", "crypto"];
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030/api/web";

export default function CreateBrokerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [brokerType, setBrokerType] = useState<BrokerType>("cfd");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/login");
    }
  }, [router]);

  async function submitBroker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const token = getAuthToken();
    const response = await fetch(`${apiBaseUrl}/brokers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify({
        name,
        slug,
        description,
        logo_url: logoUrl,
        website,
        broker_type: brokerType,
      }),
    });
    const data = await response.json();

    setSubmitting(false);

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthToken();
        router.push("/login");
      }

      setMessage(data.message ?? "Unable to create broker.");
      return;
    }

    router.push("/");
  }

  return (
    <AppShell>
      <Box maxW="720px" rounded="md" bg="#0f1f35" p={{ base: "6", md: "8" }}>
        <Heading as="h1" fontFamily="Georgia, serif" color="#d8e3f7">
          Create Broker
        </Heading>
        <Text mt="3" color="#8292aa">
          Submit a new broker record. This route and API call require login.
        </Text>

        <VStack as="form" mt="8" align="stretch" gap="5" onSubmit={submitBroker}>
          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Name
            </Text>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              required
            />
          </Box>

          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Slug
            </Text>
            <Input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="example-broker"
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              required
            />
          </Box>

          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Description
            </Text>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              minH="120px"
              required
            />
          </Box>

          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Logo URL
            </Text>
            <Input
              type="url"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              required
            />
          </Box>

          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Website
            </Text>
            <Input
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              required
            />
          </Box>

          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Broker type
            </Text>
            <Box
              as="select"
              value={brokerType}
              onChange={(event) => setBrokerType(event.target.value as BrokerType)}
              h="10"
              w="full"
              rounded="md"
              bg="#0b1a2f"
              border="1px solid #203752"
              color="#d7e2fb"
              px="3"
              required
            >
              {brokerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Box>
          </Box>

          {message ? <Text color="#ffb7c5">{message}</Text> : null}

          <Button
            type="submit"
            loading={submitting}
            bg="#aac8fb"
            color="#10213a"
            _hover={{ bg: "white" }}
          >
            Submit
          </Button>
        </VStack>
      </Box>
    </AppShell>
  );
}
