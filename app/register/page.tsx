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
import { register } from "@/lib/api";
import { toaster } from "@/lib/toaster";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitRegister(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (password !== confirmPassword) {
      setSubmitting(false);
      setMessage("Password and confirm password must match.");
      return;
    }

    try {
      await register({ full_name: fullName, email, password });
      toaster.create({
        title: "Account created",
        description: "Please log in to continue.",
        type: "success",
        duration: 4000,
      });
      router.push("/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Register failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell centered>
      <Box
        w="full"
        maxW="560px"
        rounded="md"
        bg="#0f1f35"
        p={{ base: "6", md: "8" }}
      >
        <Heading as="h1" fontFamily="Georgia, serif" color="#d8e3f7">
          Register
        </Heading>
        <Text mt="3" color="#8292aa">
          Create an account, then sign in to submit broker data.
        </Text>

        <VStack
          as="form"
          mt="8"
          align="stretch"
          gap="5"
          onSubmit={submitRegister}
        >
          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Full name
            </Text>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              bg="#0b1a2f"
              borderColor="#203752"
              color="#d7e2fb"
              required
            />
          </Box>

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

          <Box>
            <Text mb="2" color="#aebbd1" fontSize="13px" fontWeight="700">
              Confirm password
            </Text>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            Register
          </Button>

          <Text color="#8292aa" fontSize="14px">
            Already registered?{" "}
            <Link href="/login" color="#b9d0fb" fontWeight="700">
              Login
            </Link>
          </Text>
        </VStack>
      </Box>
    </AppShell>
  );
}
