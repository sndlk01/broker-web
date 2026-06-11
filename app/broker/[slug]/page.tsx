import type { Metadata } from "next";
import { getBrokerBySlug } from "@/lib/api";
import { BrokerDetailClient } from "./BrokerDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const broker = await getBrokerBySlug(slug);
    return {
      title: `${broker.name} — Broker Detail`,
      description: broker.description,
    };
  } catch {
    return {
      title: "Broker Detail",
    };
  }
}

export default async function BrokerDetailPage({ params }: Props) {
  const { slug } = await params;
  return <BrokerDetailClient slug={slug} />;
}
