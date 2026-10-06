import { getHistory } from "@/lib/market";
import { isRange } from "@/lib/ranges";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") ?? "";
  const zakres = request.nextUrl.searchParams.get("zakres") ?? "";
  if (!isRange(zakres)) {
    return Response.json({ error: "Nieznany zakres wykresu." }, { status: 400 });
  }
  const history = await getHistory(symbol, zakres);
  if (!history) {
    return Response.json({ error: "Nie ma takiego instrumentu." }, { status: 404 });
  }
  return Response.json(history, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
  });
}
