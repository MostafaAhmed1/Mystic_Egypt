"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import type { InvoiceDto } from "@/features/invoice/service";
import { CURRENCY_SYMBOLS } from "@/core/constants/currencies";
import { formatDate } from "@/core/utils";

// Client-side invoice PDF generated entirely in the browser (no server load),
// per Final Technical Blueprint Rule 4.

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#18181b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
  brandSub: { fontSize: 9, color: "#71717a", marginTop: 2 },
  invoiceMeta: { alignItems: "flex-end" },
  metaLabel: { fontSize: 9, color: "#71717a" },
  metaValue: { fontSize: 11, marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  blockLabel: { fontSize: 9, color: "#71717a", marginBottom: 4 },
  blockValue: { fontSize: 11 },
  table: { marginTop: 8, marginBottom: 24 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d8",
    paddingBottom: 6,
    marginBottom: 6,
  },
  colItem: { width: "50%" },
  colQty: { width: "15%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  headerText: { fontSize: 9, color: "#71717a" },
  cellText: { fontSize: 11, marginBottom: 4 },
  totals: { alignItems: "flex-end", marginTop: 8 },
  totalRow: {
    flexDirection: "row",
    width: "60%",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    width: "60%",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#18181b",
    paddingTop: 6,
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 10,
    fontSize: 8,
    color: "#71717a",
  },
});

export function InvoicePDF({ invoice }: { invoice: InvoiceDto }) {
  const symbol = CURRENCY_SYMBOLS[invoice.booking.currency] ?? "$";
  const money = (v: number) => `${symbol}${v.toFixed(2)}`;
  const shortId = invoice.booking.id.slice(0, 8);

  return (
    <PDFDownloadLink
      document={
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <View>
                <Text style={styles.brand}>Mystic Egypt</Text>
                <Text style={styles.brandSub}>
                  Luxury tours & experiences across Egypt
                </Text>
              </View>
              <View style={styles.invoiceMeta}>
                <Text style={styles.metaLabel}>Invoice</Text>
                <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
                <Text style={styles.metaValue}>
                  {formatDate(invoice.issued_at)}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.blockLabel}>Booking</Text>
                <Text style={styles.blockValue}>
                  {invoice.booking.tour_title}
                </Text>
                <Text style={styles.blockValue}>
                  Reference #{shortId}
                </Text>
              </View>
              <View>
                <Text style={styles.blockLabel}>Tour date</Text>
                <Text style={styles.blockValue}>
                  {formatDate(invoice.booking.tour_date)}
                </Text>
                <Text style={styles.blockValue}>
                  Travellers: {invoice.booking.num_people}
                </Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colItem, styles.headerText]}>Item</Text>
                <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
                <Text style={[styles.colPrice, styles.headerText]}>Price</Text>
                <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={[styles.colItem, styles.cellText]}>
                  {invoice.booking.tour_title} (per person)
                </Text>
                <Text style={[styles.colQty, styles.cellText]}>
                  {invoice.booking.num_people}
                </Text>
                <Text style={[styles.colPrice, styles.cellText]}>
                  {money(invoice.booking.base_price)}
                </Text>
                <Text style={[styles.colTotal, styles.cellText]}>
                  {money(invoice.tourSubtotal)}
                </Text>
              </View>
              {invoice.booking.addons.map((a, i) => (
                <View style={styles.tableHeader} key={i}>
                  <Text style={[styles.colItem, styles.cellText]}>
                    {a.name}
                  </Text>
                  <Text style={[styles.colQty, styles.cellText]}>
                    {a.quantity}
                  </Text>
                  <Text style={[styles.colPrice, styles.cellText]}>
                    {money(a.price)}
                  </Text>
                  <Text style={[styles.colTotal, styles.cellText]}>
                    {money(a.total)}
                  </Text>
                </View>
              ))}

              <View style={styles.totals}>
                <View style={styles.totalRow}>
                  <Text>Tour subtotal</Text>
                  <Text>{money(invoice.tourSubtotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text>Add-ons</Text>
                  <Text>{money(invoice.addonsTotal)}</Text>
                </View>
                <View style={styles.grandTotalRow}>
                  <Text>Total</Text>
                  <Text>{money(invoice.grandTotal)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.footer}>
              Mystic Egypt — thank you for travelling with us. Please retain
              this invoice for your records.
            </Text>
          </Page>
        </Document>
      }
      fileName={`${invoice.invoice_number}.pdf`}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {({ loading }) => (loading ? "Preparing PDF…" : "Download PDF")}
    </PDFDownloadLink>
  );
}
