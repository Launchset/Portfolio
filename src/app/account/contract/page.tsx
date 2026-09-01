import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientAccountData } from "@/src/features/portal/client-account-data";
import ClientContractPage from "@/src/features/portal/client-contract-page";
import { requirePageClientContext } from "@/src/features/portal/access";

export const dynamic = "force-dynamic";

export default async function ContractPage() {
  const { access, user } = await requirePageClientContext();
  const accountData = await getClientAccountData(access.id);
  if (
    !accountData?.client.contract_id ||
    !accountData.client.contract_title ||
    !accountData.client.contract_status
  )
    notFound();

  const { client } = accountData;
  const contractId = client.contract_id!;
  const contractStatus = client.contract_status!;
  const contractTitle = client.contract_title!;
  const signed = client.contract_status === "signed";
  return (
    <ClientContractPage
      account={{ email: user.email, image: user.image, name: user.name }}
      contract={{
        action: signed ? (
          <a href={`/api/contracts/${contractId}/file`}>View signed contract</a>
        ) : (
          <Link href={`/contracts/${contractId}/sign`}>Review and sign</Link>
        ),
        signedDate: client.signed_at
          ? new Date(client.signed_at).toLocaleDateString("en-GB")
          : null,
        status: contractStatus,
        title: contractTitle,
      }}
    />
  );
}
