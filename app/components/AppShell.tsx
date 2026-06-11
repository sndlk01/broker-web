"use client";

import {
  Box,
  Flex,
  HStack,
  Link,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  Text,
} from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  clearAuthToken,
  getUserEmail,
  hasAuthToken,
  subscribeAuthToken,
} from "@/lib/client-auth";
import { ToastContainer } from "@/lib/toaster";

const authedNavItems = [{ label: "Brokers", href: "/" }];

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
  const userEmail = useSyncExternalStore(
    subscribeAuthToken,
    getUserEmail as () => string | null,
    () => null,
  );

  const isProtectedPath =
    pathname === "/" ||
    pathname === "/create" ||
    pathname.startsWith("/broker/");
  const showAuthenticatedNav = isAuthenticated || isProtectedPath;
  const navItems = showAuthenticatedNav ? authedNavItems : publicNavItems;

  const initial = userEmail ? userEmail[0].toUpperCase() : "?";

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
        <Flex as="header" align="center" justify="space-between" gap="6" pb="8">
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
                  borderBottom={
                    active ? "1px solid #9bb9ee" : "1px solid transparent"
                  }
                  pb="1.5"
                  _hover={{ color: "#c5d8ff" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </HStack>

          {showAuthenticatedNav ? (
            <MenuRoot>
              <MenuTrigger
                bg="transparent"
                border="1px solid #1a2f4a"
                rounded="full"
                px="2"
                h="9"
                display="flex"
                alignItems="center"
                gap="2"
                color="#8da0bf"
                fontSize="13px"
                cursor="pointer"
                _hover={{
                  bg: "#0d2040",
                  borderColor: "#2a4570",
                  color: "#c5d8ff",
                }}
                transition="all 0.15s"
                maxW="220px"
              >
                <Box
                  w="6"
                  h="6"
                  rounded="full"
                  bg="#1e3d6b"
                  border="1px solid #2e5490"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="11px"
                  fontWeight="700"
                  color="#a8caff"
                  flexShrink={0}
                >
                  {initial}
                </Box>
                <Text
                  fontSize="12px"
                  color="#8da0bf"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  maxW="140px"
                >
                  {userEmail ?? "Account"}
                </Text>
                <svg
                  viewBox="0 0 10 6"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, opacity: 0.6 }}
                >
                  <path d="m1 1 4 4 4-4" />
                </svg>
              </MenuTrigger>

              <MenuPositioner>
                <MenuContent
                  bg="#0a1929"
                  border="1px solid #1a2f4a"
                  rounded="xl"
                  boxShadow="0 16px 40px rgba(0,0,0,0.4)"
                  minW="200px"
                  py="1"
                >
                  <Box px="4" py="3" borderBottom="1px solid #0f2238">
                    <Text
                      fontSize="10px"
                      color="#3d5573"
                      fontWeight="700"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                      mb="1"
                    >
                      Signed in as
                    </Text>
                    <Text fontSize="13px" color="#8da0bf" wordBreak="break-all">
                      {userEmail ?? "—"}
                    </Text>
                  </Box>
                  <MenuSeparator borderColor="#0f2238" />
                  <MenuItem
                    value="logout"
                    color="#ffb7c5"
                    fontSize="13px"
                    px="4"
                    py="2"
                    cursor="pointer"
                    _hover={{ bg: "#1a0a14", color: "#ffd0d8" }}
                    onClick={logout}
                  >
                    Logout
                  </MenuItem>
                </MenuContent>
              </MenuPositioner>
            </MenuRoot>
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
