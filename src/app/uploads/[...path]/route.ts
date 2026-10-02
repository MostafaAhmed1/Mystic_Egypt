import { promises as fs } from "node:fs";
import path from "node:path";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function notFound(): Response {
  return new Response("Not Found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

function resolveUploadPath(segments: string[]): string | null {
  if (segments.length === 0) return null;

  const decoded: string[] = [];
  for (const raw of segments) {
    let segment: string;
    try {
      segment = decodeURIComponent(raw);
    } catch {
      return null;
    }
    if (
      segment.length === 0 ||
      segment === "." ||
      segment === ".." ||
      segment.includes("/") ||
      segment.includes("\\") ||
      segment.includes("\0")
    ) {
      return null;
    }
    decoded.push(segment);
  }

  const resolved = path.resolve(UPLOADS_ROOT, ...decoded);
  if (!resolved.startsWith(UPLOADS_ROOT + path.sep)) return null;
  return resolved;
}

async function serveUpload(segments: string[], includeBody: boolean): Promise<Response> {
  const filePath = resolveUploadPath(segments);
  if (!filePath) return notFound();

  const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) return notFound();

  try {
    // turbopackIgnore: request-scoped path under public/uploads (bind-mounted at
    // runtime) — without it Turbopack traces the WHOLE project into standalone
    // output (~500 MB bundle instead of ~45 MB).
    const stats = await fs.stat(/*turbopackIgnore: true*/ filePath);
    if (!stats.isFile()) return notFound();

    const data = await fs.readFile(/*turbopackIgnore: true*/ filePath);
    const headers = {
      "Cache-Control": "public, max-age=86400",
      "Content-Length": String(stats.size),
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    };
    if (!includeBody) return new Response(null, { status: 200, headers });
    return new Response(new Uint8Array(data), { status: 200, headers });
  } catch {
    return notFound();
  }
}

type UploadRouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: UploadRouteContext) {
  const { path: segments } = await params;
  return serveUpload(segments, true);
}

export async function HEAD(_request: Request, { params }: UploadRouteContext) {
  const { path: segments } = await params;
  return serveUpload(segments, false);
}
