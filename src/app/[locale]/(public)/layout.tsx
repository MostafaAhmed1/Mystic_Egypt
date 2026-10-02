import { PublicHeader } from "@/shared/components/public-header";
import { PublicFooter } from "@/shared/components/public-footer-client";
import { BUSINESS } from "@/core/constants/business";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const phoneUK = process.env.NEXT_PUBLIC_PHONE_UK ?? BUSINESS.phoneUK.display;
  const phoneEG = process.env.NEXT_PUBLIC_PHONE_EG ?? BUSINESS.phoneEG.display;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter phoneUK={phoneUK} phoneEG={phoneEG} whatsapp={whatsapp} />
    </div>
  );
}
