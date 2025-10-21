import React from "react";
import { Document, Page, Text, StyleSheet, Font, View } from "@react-pdf/renderer";
import path from "path";

// --- FONT REGISTRATION ---
Font.register({
  family: "Lato",
  fonts: [
    { src: path.join(process.cwd(), "app/fonts/Lato-Regular.ttf") },
    { src: path.join(process.cwd(), "app/fonts/Lato-Bold.ttf"), fontWeight: 'bold' },
  ]
});

Font.register({
  family: "Almarai",
  fonts: [
    { src: path.join(process.cwd(), "app/fonts/Almarai-Regular.ttf") },
    { src: path.join(process.cwd(), "app/fonts/Almarai-Bold.ttf"), fontWeight: 'bold' },
  ]
});


// --- STYLES (OPTIMIZED FOR A SINGLE PAGE) ---
const styles = StyleSheet.create({
  page: {
    padding: 30, // Reduced from 40
    fontFamily: "Lato",
    fontSize: 9.5, // Reduced from 10
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  // --- Header ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20, // Reduced from 25
    paddingBottom: 8, // Reduced from 10
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 28, // Reduced from 32
    fontWeight: 'bold',
    color: '#000000',
  },
  crNoteText: {
    fontSize: 12,
    marginTop: 5,
    color: '#333333',
    fontWeight: 'bold',
  },
  headerCompanyInfo: {
    fontSize: 9.5, // Reduced from 10
    textAlign: 'right',
  },
  // --- Section Headers ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    padding: 6, // Reduced from 8
    marginTop: 15, // Reduced from 20
    marginBottom: 5,
  },
  sectionTitleLeft: {
    fontWeight: 'bold',
    fontSize: 10.5, // Reduced from 11
  },
  sectionTitleRight: {
    fontWeight: 'bold',
    fontFamily: 'Almarai',
    fontSize: 10.5, // Reduced from 11
  },
  // --- Three-Column Row Styles ---
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6, // Reduced from 8
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  evenRow: {
    backgroundColor: '#F9F9F9',
  },
  colLeft: {
    width: '40%',
    textAlign: 'left',
  },
  colCenter: {
    width: '30%',
    textAlign: 'left',
  },
  colRight: {
    width: '30%',
    textAlign: 'right',
    fontFamily: 'Almarai',
  },
  // Special styling for summary rows
  payableRow: {
    backgroundColor: '#F0F8FF',
  },
  payableText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  carriedForwardText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});

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
            <Text style={styles.crNoteText}>CR Note #: {row.CR_Note ?? "N/A"}</Text>
            <View style={styles.headerCompanyInfo}>
              <Text style={styles.bold}>Madinat Sandan LLC</Text>
              <Text>Halban, Nakhal, Oman</Text>
              <Text>Contact: +968 90999980</Text>
            </View>
          </View>

          {/* --- Owner & Unit Details --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLeft}>Owner & Unit Details</Text>
            <Text style={styles.sectionTitleRight}>تفاصيل المالك والوحدة</Text>
          </View>
          <View style={styles.tableRow}><Text style={styles.colLeft}>Unit</Text><Text style={styles.colCenter}>{row.Unit ?? ""}</Text><Text style={styles.colRight}>الوحدة</Text></View>
          <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Name of Owner</Text><Text style={styles.colCenter}>{row.Name_of_Owner ?? ""}</Text><Text style={styles.colRight}>اسم المالك</Text></View>
          <View style={styles.tableRow}><Text style={styles.colLeft}>Owner ID No.</Text><Text style={styles.colCenter}>{row.Owner_ID_No ?? ""}</Text><Text style={styles.colRight}>رقم الهوية</Text></View>
          <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Contact</Text><Text style={styles.colCenter}>{row.Contact ?? ""}</Text><Text style={styles.colRight}>رقم التواصل</Text></View>
          <View style={styles.tableRow}><Text style={styles.colLeft}>Community Charge up to 2025 End</Text><Text style={styles.colCenter}>{row.Community_Charge_up_to_2025_End ?? "0.0"}</Text><Text style={styles.colRight}>الرسوم المجتمعية حتى نهاية 2025</Text></View>

          {/* --- Financial Details --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLeft}>Financial Details</Text>
            <Text style={styles.sectionTitleRight}>التفاصيل</Text>
          </View>
          <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Rent Collected (O.R):</Text><Text style={[styles.colCenter, styles.bold]}>{row.Rent_collected ?? "0.000"} O.R</Text><Text style={styles.colRight}>:(.الإيجار المحصل (ر.ع</Text></View>
          <View style={styles.tableRow}><Text style={styles.colLeft}>Against Month of</Text><Text style={[styles.colCenter, styles.bold]}>{row.Against_month_of ?? ""}</Text><Text style={styles.colRight}>عن شهر</Text></View>

          {/* --- Deductions --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLeft}>Deductions (O.R):</Text>
            <Text style={styles.sectionTitleRight}>:(.الإستقطاعات (ر.ع</Text>
          </View>
          <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Leasing Commission</Text><Text style={styles.colCenter}>{row.Leasing_Commission ?? "0.000"}</Text><Text style={styles.colRight}>عمولة التأجير</Text></View>
          <View style={styles.tableRow}><Text style={styles.colLeft}>Property Management Fee</Text><Text style={styles.colCenter}>{row.Property_Management_Fee ?? "0.000"}</Text><Text style={styles.colRight}>رسوم إدارة الوحدة</Text></View>
          <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>5% VAT</Text><Text style={styles.colCenter}>{row.VAT_on_Management_Fee_and_Commission ?? "0.0"}</Text><Text style={styles.colRight}>% ضريبة القيمة المضافة 5</Text></View>
          <View style={styles.tableRow}><Text style={styles.colLeft}>Municipality Fee</Text><Text style={styles.colCenter}>{row.Municipality_Fee ?? "0.000"}</Text><Text style={styles.colRight}>رسوم البلدية</Text></View>
          <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Community</Text><Text style={styles.colCenter}>{row.Community ?? "0.000"}</Text><Text style={styles.colRight}>الرسوم المجتمعية</Text></View>
          <View style={styles.tableRow}><Text style={styles.colLeft}>Maintenance</Text><Text style={styles.colCenter}>{row.Maintenance ?? "0.000"}</Text><Text style={styles.colRight}>الصيانة</Text></View>
          <View style={[styles.tableRow, styles.evenRow, styles.payableRow]}><Text style={[styles.colLeft, styles.bold]}>Payable to Owner</Text><Text style={[styles.colCenter, styles.payableText]}>{row.Payable_to_Owner ?? "0.000"}</Text><Text style={[styles.colRight, styles.bold]}>المبلغ المستحق للمالك</Text></View>
          <View style={styles.tableRow}><Text style={[styles.colLeft, styles.bold]}>Community Charge Carried Forward</Text><Text style={[styles.colCenter, styles.carriedForwardText]}>{row.Community_charge_Carried_forward ?? "0.000"}</Text><Text style={[styles.colRight, styles.bold]}>الرسوم المجتمعية المرحلة</Text></View>

        </Page>
      ))}
    </Document>
  );
};