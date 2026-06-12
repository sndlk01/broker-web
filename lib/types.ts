export type BrokerType = "cfd" | "bond" | "stock" | "crypto";

export type Broker = {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  broker_type: BrokerType;
};

export type BrokerPayload = Omit<Broker, "id">;

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token?: string;
  token?: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
};
