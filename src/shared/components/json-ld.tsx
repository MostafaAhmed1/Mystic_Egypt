import type { JSX } from "react";
import type { JsonLdObject } from "@/core/utils/structured-data";

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

/** Server-safe JSON-LD script element. Escapes `<` so database/user-provided
 *  content inside the data can never terminate the tag early (script breakout). */
export function JsonLd({ data }: JsonLdProps): JSX.Element {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}