"use client";

import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "../components/AppShell";
import { login } from "@/lib/api";
import { saveAuthToken, saveUserEmail } from "@/lib/client-auth";
import { toaster } from "@/lib/toaster";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const data = await login({ email, password });
      const token = data.access_token ?? data.token;

      if (!token) {
        setMessage("Login response did not include an access token.");
        return;
      }

      saveAuthToken(token);
      saveUserEmail(email);
      toaster.create({
        title: "Logged in",
        description: `Welcome back, ${email}`,
        type: "success",
        duration: 3000,
      });
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.push(nextPath ?? "/manage");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell centered>
      <Box
        w="full"
        maxW="520px"
        rounded="md"
        bg="#0f1f35"
        p={{ base: "6", md: "8" }}
      >
        <Heading as="h1" fontFamily="Georgia, serif" color="#d8e3f7">
          Login
        </Heading>
        <Text mt="3" color="#8292aa">
          Sign in before creating broker records.
        </Text>

        <VStack as="form" mt="8" align="stretch" gap="5" onSubmit={submitLogin}>
          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Email
            </Text>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              required
            />
          </Box>

          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Password
            </Text>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              required
            />
          </Box>

          {message ? <Text color="#ffb7c5">{message}</Text> : null}

          <Button
            type="submit"
            loading={submitting}
            bg="#aac8fb"
            color="#10213a"
            _hover={{ bg: "white" }}
          >
            Login
          </Button>

          <Text color="#8292aa" fontSize="14px">
            No account yet?{" "}
            <Link href="/register" color="#b9d0fb" fontWeight="700">
              Register
            </Link>
          </Text>
        </VStack>
      </Box>
    </AppShell>
  );
}
