import React from "react";
import { Document, Page, Text, StyleSheet, Font, View } from "@react-pdf/renderer";
import path from "path";

// --- FONT REGISTRATION ---
Font.register({
  family: "Times-Roman",
  src: path.join(process.cwd(), "app/fonts/times.ttf"),
});

Font.register({
  family: "Lato",
  fonts: [
    { src: path.join(process.cwd(), "app/fonts/Lato-Regular.ttf") },
    { src: path.join(process.cwd(), "app/fonts/Lato-Bold.ttf"), fontWeight: 'bold' },
  ]
});

Font.register({
  family: "Amiri",
  fonts: [
    { src: path.join(process.cwd(), "app/fonts/Amiri-Regular.ttf") },
    { src: path.join(process.cwd(), "app/fonts/Amiri-Bold.ttf"), fontWeight: 'bold' },
  ]
});


// --- STYLES (AGGRESSIVELY OPTIMIZED FOR ONE PAGE) ---
const styles = StyleSheet.create({
  page: {
    padding: 30, // Reduced page margins
    fontFamily: "Lato",
    fontSize: 8, // Reduced base font size
    backgroundColor: '#F8F9FA',
    color: '#495057',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20, // Reduced margin
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Times-Roman",
    color: '#212529',
  },
  headerCompanyInfo: {
    fontSize: 9,
    textAlign: 'right',
    color: '#495057',
  },
  companyName: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15, // Reduced padding
    borderRadius: 5,
    border: '1px solid #E9ECEF',
    marginBottom: 10, // Reduced margin
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#212529',
    marginBottom: 6, // Reduced margin
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  // Table Rows
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5, // Tighter row padding
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    alignItems: 'center',
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableColLabel: {
    width: '50%',
  },
  tableColValue: {
    width: '50%',
    textAlign: 'right',
    color: '#212529',
    fontSize: 8.5,
  },
  arabicLabel: {
    fontSize: 7, // Made smaller to fit
    color: '#868E96',
    marginTop: 1, // Reduced space
    fontFamily: "Amiri",
  },
  // Summary
  summarySection: {
    marginTop: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: '#DEE2E6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2, // Tighter padding
    alignItems: 'center'
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#2980B9',
    fontSize: 8.5,
  },
  payableValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E67E22',
  },
  // Helpers
  bold: { fontWeight: 'bold' },
});

// The crash-proof component for rendering bilingual text vertically
const BilingualLabel = ({ english, arabic, style, bold = false }: { english: string, arabic: string, style?: any, bold?: boolean }) => (
  <View style={style}>
    <Text style={bold ? styles.bold : {}}>{english}</Text>
    <Text style={styles.arabicLabel}>{arabic}</Text>
  </View>
);

interface PDFProps {
  selectedRows: any[];
}

export const PDFDocumentComponent: React.FC<PDFProps> = ({ selectedRows }) => {
  return (
    <Document>
      {selectedRows.map((row, index) => (
        <Page size="A4" style={styles.page} key={index}>

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>CREDIT NOTE</Text>
            <View style={styles.headerCompanyInfo}>
              <Text style={styles.companyName}>Madinat Sandan LLC</Text>
              <Text>Halban, Nakhal, Oman</Text>
              <Text>Contact: +968 90999980</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Owner & Unit Details</Text>
            <View style={styles.tableRow}><BilingualLabel english="Unit" arabic="الوحدة" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Unit ?? ""}</Text></View>
            <View style={styles.tableRow}><BilingualLabel english="Name of Owner" arabic="اسم المالك" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Name_of_Owner ?? ""}</Text></View>
            <View style={styles.tableRow}><BilingualLabel english="Owner ID No." arabic="رقم الهوية" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Owner__ID_No ?? ""}</Text></View>
            <View style={styles.tableRow}><BilingualLabel english="Contact" arabic="الاتصال" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Contact ?? ""}</Text></View>
            <View style={[styles.tableRow, styles.lastTableRow]}><BilingualLabel english="Community Charge up to 2025 End" arabic="رسوم المجتمع حتى نهاية 2025" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Community_Charge_up_to_2025_End ?? "0.0"}</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Financial Details</Text>
            <View style={styles.tableRow}><BilingualLabel english="Rent Collected" arabic="الإيجار المحصل" style={styles.tableColLabel} bold={true} /><Text style={[styles.tableColValue, styles.bold]}>{row.Rent_collected ?? "0.000"} O.R</Text></View>
            <View style={[styles.tableRow, styles.lastTableRow]}><BilingualLabel english="Against Month of" arabic="عن شهر" style={styles.tableColLabel} bold={true} /><Text style={[styles.tableColValue, styles.bold]}>{row.Against_month_of ?? ""}</Text></View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>Deductions</Text>
              <View style={styles.tableRow}><BilingualLabel english="Leasing Commission" arabic="عمولة التأجير" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Leasing_Commission ?? "0.000"}</Text></View>
              <View style={styles.tableRow}><BilingualLabel english="Property Management Fee" arabic="رسوم إدارة الممتلكات" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Property_Management_Fee ?? "0.000"}</Text></View>
              <View style={styles.tableRow}><BilingualLabel english="5% VAT" arabic="5% ضريبة القيمة المضافة" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.VAT_on_Management_Fee_and_Commission ?? "0.0"}</Text></View>
              <View style={styles.tableRow}><BilingualLabel english="Municipality Fee" arabic="رسوم البلدية" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Municipality_Fee ?? "0.000"}</Text></View>
              <View style={styles.tableRow}><BilingualLabel english="Community" arabic="رسوم المجتمع" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Community ?? "0.000"}</Text></View>
              <View style={[styles.tableRow, styles.lastTableRow]}><BilingualLabel english="Maintenance" arabic="صيانة" style={styles.tableColLabel} /><Text style={styles.tableColValue}>{row.Maintenance ?? "0.000"}</Text></View>
            </View>

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <BilingualLabel english="Payable to Owner" arabic="مستحق للمالك" style={styles.summaryLabel} bold={true} />
                <Text style={styles.payableValue}>{row.Payable_to_Owner ?? "0.000"} O.R</Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: 2 }]}>
                <BilingualLabel english="Community Charge Carried Forward" arabic="رسوم المجتمع المرحلة" style={styles.summaryLabel} bold={true} />
                <Text style={styles.summaryValue}>{row.Community_charge_Carried_forward ?? "0.000"} O.R</Text>
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};