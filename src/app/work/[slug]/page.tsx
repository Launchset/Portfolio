import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPageContent from "@/src/features/work/project-page";
import { projectDetails } from "@/src/features/work/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(projectDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projectDetails[slug];
  if (!project) return {};

  return {
    title: `${project.title} | Launchset Work`,
    description: project.summary,
    alternates: { canonical: project.href },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projectDetails[slug];
  if (!project) notFound();

  return <ProjectPageContent project={project} />;
}
