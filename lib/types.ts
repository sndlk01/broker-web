export type BrokerType = "cfd" | "bond" | "stock" | "crypto";

export type Broker = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  broker_type: BrokerType;
};
