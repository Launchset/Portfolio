import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolPageContent, { architectures } from "@/src/features/work/tools/tool-page";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(architectures).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const architecture = architectures[slug];
  if (!architecture) return {};

  return {
    title: `${architecture.title} Architecture | Launchset`,
    description: architecture.intro,
    alternates: { canonical: `/work/tools/${slug}` },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const architecture = architectures[slug];
  if (!architecture) notFound();

  return <ToolPageContent architecture={architecture} />;
}
