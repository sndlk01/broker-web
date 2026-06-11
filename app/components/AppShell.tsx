"use client";

import { Box, Button, Flex, HStack, Link, Text } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  clearAuthToken,
  hasAuthToken,
  subscribeAuthToken,
} from "@/lib/client-auth";
import { ToastContainer } from "@/lib/toaster";

const authedNavItems = [
  { label: "Brokers", href: "/" },
];

const publicNavItems = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
];

export function AppShell({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeAuthToken,
    hasAuthToken,
    () => false,
  );
  const isProtectedPath =
    pathname === "/" || pathname === "/create" || pathname.startsWith("/broker/");
  const showAuthenticatedNav = isAuthenticated || isProtectedPath;

  const navItems = showAuthenticatedNav ? authedNavItems : publicNavItems;

  function logout() {
    clearAuthToken();
    router.push("/login");
  }

  return (
    <Box minH="100vh" bg="#071426" color="#d7e2fb">
      <Flex
        mx="auto"
        minH="100vh"
        w="full"
        maxW="1280px"
        direction="column"
        px={{ base: "5", md: "8", xl: "10" }}
        py="5"
      >
        <Flex
          as="header"
          align="center"
          justify="space-between"
          gap="6"
          pb="8"
        >
          <Link
            href="/"
            color="#aecdff"
            fontSize="20px"
            fontWeight="800"
            letterSpacing="-0.02em"
          >
            Woxa
          </Link>

          <HStack
            as="nav"
            aria-label="Primary navigation"
            gap={{ base: "3", md: "7" }}
            color="#7889a4"
            fontSize="13px"
          >
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  color={active ? "#c5d8ff" : "currentColor"}
                  borderBottom={active ? "1px solid #9bb9ee" : "1px solid transparent"}
                  pb="1.5"
                  _hover={{ color: "#c5d8ff" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </HStack>

          {showAuthenticatedNav ? (
            <Button
              size="sm"
              variant="ghost"
              color="#aecaef"
              _hover={{ bg: "#10233d", color: "white" }}
              onClick={logout}
            >
              Logout
            </Button>
          ) : (
            <Box />
          )}
        </Flex>

        <Flex
          as="main"
          flex="1"
          align={centered ? "center" : "stretch"}
          justify={centered ? "center" : "flex-start"}
          pb={centered ? { base: "10", md: "16" } : "0"}
        >
          {children}
        </Flex>

        <ToastContainer />

        <Flex
          as="footer"
          mt="12"
          borderTop="1px solid #0d2138"
          py="8"
          direction={{ base: "column", md: "row" }}
          gap="4"
          color="#536780"
          fontSize="10px"
          letterSpacing="0.18em"
          textTransform="uppercase"
        >
          <Text color="#aecdff" fontWeight="800" textTransform="none">
            Woxa
          </Text>
          <Text ml={{ md: "auto" }}>
            2024 Sterling Midnight. All rights reserved.
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
