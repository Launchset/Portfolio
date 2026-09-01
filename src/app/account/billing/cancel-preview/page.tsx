import { notFound } from "next/navigation";
import CancellationPreview from "./cancellation-preview";

export default async function CancellationPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const requestedScreen = (await searchParams).screen;
  const initialScreen =
    requestedScreen === "contract" || requestedScreen === "billing"
      ? requestedScreen
      : "overview";
  return <CancellationPreview initialScreen={initialScreen} />;
}
