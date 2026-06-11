import type {
  Broker,
  BrokerPayload,
  BrokerType,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "./types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030/api/web";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers();

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "Request failed.";

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

function unwrapBrokerList(payload: unknown): Broker[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const objectPayload = payload as {
      data?: unknown;
      brokers?: unknown;
    };
    const value = objectPayload.data ?? objectPayload.brokers;

    if (Array.isArray(value)) {
      return value as Broker[];
    }
  }

  return [];
}

function unwrapBroker(payload: unknown): Broker {
  const value =
    payload && typeof payload === "object"
      ? ((payload as { data?: unknown; broker?: unknown }).data ??
        (payload as { broker?: unknown }).broker ??
        payload)
      : payload;

  return value as Broker;
}

export async function login(payload: LoginPayload) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function register(payload: RegisterPayload) {
  return request("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function listBrokers({
  search,
  type,
  token,
}: {
  search?: string;
  type?: BrokerType | "all";
  token?: string | null;
}) {
  const params = new URLSearchParams();
  const trimmedSearch = search?.trim();

  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  if (type && type !== "all") {
    params.set("type", type);
  }

  const queryString = params.toString();
  const payload = await request(
    queryString ? `/brokers?${queryString}` : "/brokers",
    { token },
  );

  return unwrapBrokerList(payload);
}

export async function getBrokerBySlug(
  slug: string,
  options: { token?: string | null } = {},
) {
  const payload = await request(`/brokers/${slug}`, {
    token: options.token,
  });

  return unwrapBroker(payload);
}

export async function createBroker(
  payload: BrokerPayload,
  options: { token?: string | null } = {},
) {
  const responsePayload = await request("/brokers", {
    method: "POST",
    body: payload,
    token: options.token,
  });

  return unwrapBroker(responsePayload);
}
