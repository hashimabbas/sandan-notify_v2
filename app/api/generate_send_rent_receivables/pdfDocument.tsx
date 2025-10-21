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


// --- STYLES TO MATCH THE RENT INVOICE DESIGN ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Lato",
    fontSize: 9.5,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerCompanyInfo: {
    fontSize: 9.5,
    textAlign: 'right',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    padding: 6,
    marginTop: 15,
    marginBottom: 5,
  },
  sectionTitleLeft: {
    fontWeight: 'bold',
    fontSize: 10.5,
  },
  sectionTitleRight: {
    fontWeight: 'bold',
    fontFamily: 'Almarai',
    fontSize: 10.5,
  },
  // Three-Column Row Styles
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  evenRow: {
    backgroundColor: '#F9F9F9',
  },
  colLeft: { width: '40%', textAlign: 'left' },
  colCenter: { width: '30%', textAlign: 'left' },
  colRight: { width: '30%', textAlign: 'right', fontFamily: 'Almarai' },
  // Note Styles
  noteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 8,
    border: '1px solid #EAEAEA',
    backgroundColor: '#FFF8F8',
  },
  noteLeft: {
    width: '65%',
  },
  noteRight: {
    width: '35%',
    textAlign: 'right',
  },
  noteText: {
    color: '#D9534F',
    fontSize: 9,
  },
  noteLabel: { fontWeight: 'bold' },
  noteArabic: { fontFamily: 'Almarai' },
  // Total Amount Row
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 8,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 2,
    borderTopColor: '#333333',
  },
  totalText: { fontSize: 11, fontWeight: 'bold' },
  totalAmount: { fontSize: 11, fontWeight: 'bold', color: '#FF8C00' },
  totalArabic: { fontFamily: 'Almarai', fontWeight: 'bold' },
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerColumn: {
    width: '50%',
  },
  footerText: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 2,
  },
  footerArabicText: {
    fontFamily: 'Almarai',
    textAlign: 'right',
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

          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>RENT INVOICE</Text>
              <View style={styles.headerCompanyInfo}>
                <Text style={styles.bold}>Madinat Sandan LLC</Text>
                <Text>Halban, Nakhal, Oman</Text>
                <Text>Contact: +968 90999980</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleLeft}>Tenant & Unit Details</Text>
              <Text style={styles.sectionTitleRight}>تفاصيل المستأجر والوحدة</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.colLeft}>Unit</Text>
              <Text style={styles.colCenter}>{row.BUT_ID ?? ""}</Text>
              <Text style={styles.colRight}>رقم الوحدة</Text>
            </View>
            <View style={styles.tableRow}><Text style={styles.colLeft}>Tenant Name</Text><Text style={styles.colCenter}>{row.Tenant_Name ?? ""}</Text><Text style={styles.colRight}>اسم المستأجر</Text></View>
            <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Contact</Text><Text style={styles.colCenter}>{row.Contact ?? ""}</Text><Text style={styles.colRight}>رقم التواصل</Text></View>
            <View style={styles.tableRow}><Text style={styles.colLeft}>Lease Start Date</Text><Text style={styles.colCenter}>{row.Lease_Start_Date ?? ""}</Text><Text style={styles.colRight}>تاريخ بدء عقد الإيجار</Text></View>
            <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Lease End Date</Text><Text style={styles.colCenter}>{row.Lease_End_Date ?? ""}</Text><Text style={styles.colRight}>تاريخ انتهاء عقد الإيجار</Text></View>
            <View style={styles.tableRow}><Text style={styles.colLeft}>Rent Start Month</Text><Text style={styles.colCenter}>{row.Rent_start_month ?? ""}</Text><Text style={styles.colRight}>شهر بداية الإيجار</Text></View>

            {/* --- ** LOGIC FOR MULTIPLE NOTES ** --- */}

            {/* Note 1: Lease Expired */}
            {row.Remarks === "The lease has expired and is automatically renewed by law. Please follow up to complete the procedures." && (
              <View style={styles.noteContainer}>
                <View style={styles.noteLeft}>
                  <Text style={styles.noteText}>
                    <Text style={styles.noteLabel}>Note: </Text>
                    The lease has expired and is automatically renewed by law. Please contact with 94339229 to complete the procedures.
                  </Text>
                </View>
                <View style={styles.noteRight}>
                  <Text style={[styles.noteText, styles.noteArabic]}>
                    <Text style={styles.noteLabel}>ملاحظة: </Text>
                    عقد الإيجار منتهي، ويتجدد تلقائيا بموجب القانون، الرجاء التواصل على 94339229 لاستكمال الإجراءات.
                  </Text>
                </View>
              </View>
            )}

            {/* Note 2: Lease Expiring Soon (NEW) */}
            {row.Remarks === "The lease will expire soon and will be automatically renewed by law. Please follow up to complete the procedures." && (
              <View style={styles.noteContainer}>
                <View style={styles.noteLeft}>
                  <Text style={styles.noteText}>
                    <Text style={styles.noteLabel}>Note: </Text>
                    The lease will expire soon and will be automatically renewed by law. Please contact with 94339229 to complete the procedures.
                  </Text>
                </View>
                <View style={styles.noteRight}>
                  <Text style={[styles.noteText, styles.noteArabic]}>
                    <Text style={styles.noteLabel}>ملاحظة: </Text>
                    عقد الإيجار سينتهي قريبا، وسوف يتجدد تلقائيا بموجب القانون، الرجاء التواصل على 94339229 لاستكمال الإجراءات.
                  </Text>
                </View>
              </View>
            )}


            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleLeft}>Rent Details</Text>
              <Text style={styles.sectionTitleRight}>تفاصيل الإيجار</Text>
            </View>
            <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Against Month of</Text><Text style={styles.colCenter}>{row.Against_month_of ?? ""}</Text><Text style={styles.colRight}>عن شهر</Text></View>
            <View style={styles.tableRow}><Text style={styles.colLeft}>Rent Amount (O.R):</Text><Text style={styles.colCenter}>{row.Rent_Amount ?? "0.000"}</Text><Text style={styles.colRight}>:(.قيمة الإيجار (ر.ع</Text></View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleLeft}>Outstandings</Text>
              <Text style={styles.sectionTitleRight}>المستحقات السابقة</Text>
            </View>
            <View style={[styles.tableRow, styles.evenRow]}><Text style={styles.colLeft}>Number of Months:</Text><Text style={styles.colCenter}>{row.Number_of_Months ?? "0"}</Text><Text style={styles.colRight}>عدد الأشهر</Text></View>
            <View style={styles.tableRow}><Text style={styles.colLeft}>Amount (O.R):</Text><Text style={styles.colCenter}>{row.Amount ?? "0.000"}</Text><Text style={styles.colRight}>:(.المبلغ (ر.ع</Text></View>

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total Amount (O.R):</Text>
              <Text style={styles.totalAmount}>{row.Total_Amount ?? "0.000"}</Text>
              <Text style={[styles.totalText, styles.totalArabic]}>:(.المبلغ الإجمالي (ر.ع</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerText}>• For payment, please transfer to the following A/C:</Text>
              <Text style={styles.footerText}>Madinat Sandan LLC.</Text>
              <Text style={styles.footerText}>Account No: 0423055371640032 ,</Text>
              <Text style={styles.footerText}>Bank Muscat, Corporate Branch.</Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={[styles.footerText, styles.footerArabicText]}>للدفع، الرجاء التحويل على الحساب التالي: •</Text>
              <Text style={[styles.footerText, styles.footerArabicText]}>مدينة سندان ش م م</Text>
              <Text style={[styles.footerText, styles.footerArabicText]}>رقم الحساب: 0423055371640032</Text>
              <Text style={[styles.footerText, styles.footerArabicText]}>بنك مسقط</Text>
            </View>
          </View>

        </Page>
      ))}
    </Document>
  );
};