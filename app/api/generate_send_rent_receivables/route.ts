import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import clientPromise from '../../lib/mongodb'; 
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db('notify_app');

  try {
    const log = [];
    const { selectedRows } = await req.json(); // This contains rows from the Excel sheet

    if (!selectedRows || selectedRows.length === 0) {
      return NextResponse.json({ message: 'No rows selected' }, { status: 400 });
    }

    for (const row of selectedRows) {
      try {
        // PDF creation
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 700]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Font sizes
        const headerFontSize = 12;
        const regularFontSize = 10;
        const titleFontSize = 18;
        const boldFontSize = 10;
        const lineHeight = 20;

        // Draw Header
        page.drawText('Rent Invoice', { x: 50, y: 650, size: titleFontSize, font });
        page.drawLine({ start: { x: 50, y: 645 }, end: { x: 200, y: 645 }, thickness: 1, color: rgb(0, 0, 0) });
        page.drawText('Madinat Sandan LLC', { x: 50, y: 620, size: headerFontSize, font, color: rgb(0.2, 0.2, 0.7) });
        page.drawText('Halban, Nakhal, Oman', { x: 50, y: 605, size: regularFontSize, font });
        page.drawText('Contact: +968 90999980', { x: 50, y: 590, size: regularFontSize, font });

        // First Table: Owner Details from Excel Sheet
        const ownerTable = [
          { label: 'Unit', value: row.BUT_ID ?? '' },
          { label: 'Tenant Name', value: row.Tenant_Name ?? '' },
          { label: 'Contact', value: row.Contact ?? '' },
          { label: 'Lease Start Date', value: row.Lease_Start_Date ?? '' },
          { label: 'Lease End Date', value: row.Lease_End_Date ?? '' },
          { label: 'Rent Start Month', value: row.Rent_start_month ?? '' },
        ];

        const startY = 570;
        const startX = 50;
        const columnWidths = [200, 200];

        // Draw table header

        let positionY = startY - lineHeight;

        // Draw owner details table
        ownerTable.forEach((data) => {
          page.drawText(data.label, { x: startX, y: positionY, size: regularFontSize, font });
          page.drawText(data.value.toString(), {
            x: startX + columnWidths[0],
            y: positionY,
            size: regularFontSize,
            font: data.bold ? fontBold : font,
          });
          positionY -= lineHeight;

          // Draw a line under each row
          page.drawLine({
            start: { x: startX, y: positionY + lineHeight - 5 },
            end: { x: startX + columnWidths.reduce((a, b) => a + b), y: positionY + lineHeight - 5 },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8),
          });
        });
        // Draw the "Note:" row

        // Draw the "Note:" header
        page.drawText('Note:', {
          x: startX , // Adjust x position if necessary
          y: positionY, // Adjust y position based on your layout
          size: headerFontSize, 
          font: fontBold // Bold font for the "Detail" header
        });

        // Make the line longer and thicker (not bold, just a regular line)
        page.drawLine({
          start: { x: startX , y: positionY - 2 }, // Start under "Detail"
          end: { x: startX + 250, y: positionY - 2 }, // Make the line longer (adjust the value)
          thickness: 0.5, // Thicker line (increase as needed)
          color: rgb(0.8, 0.8, 0.8),
        });



        // Move the position down for the next line (adjust as needed)
        positionY -= lineHeight;
        if(row.Remarks != "-"){
          // Draw the red sentence under the row
          page.drawText('The Municipal Agreement has Expired, please proceed for renewal.', {
            x: startX, 
            y: positionY, // Place this below the line
            size: regularFontSize,
            font,
            color: rgb(1, 0, 0) // Red color for the text
          });
        }

        // Move positionY down for future elements
        positionY -= lineHeight;
        positionY -= lineHeight;

        //new table
       

        // Draw the " Rent Details" header
        page.drawText(' Rent Details:', {
          x: startX + 150 , // Adjust x position if necessary
          y: positionY, // Adjust y position based on your layout
          size: headerFontSize, 
          font: fontBold // Bold font for the "Detail" header
        });

        // Make the line longer and thicker (not bold, just a regular line)
        page.drawLine({
          start: { x: startX , y: positionY - 2 }, // Start under "Detail"
          end: { x: startX + 250, y: positionY - 2 }, // Make the line longer (adjust the value)
          thickness: 0.5, // Thicker line (increase as needed)
          color: rgb(0.8, 0.8, 0.8),
        });

        positionY -= lineHeight;
        // Draw table 2  Rent Details
        

        page.drawText('Against month of', { x: startX , y: positionY, size: headerFontSize, font: fontBold });
        page.drawText('Rent Amount (O.R)', { x: startX + columnWidths[0], y: positionY, size: headerFontSize, font:fontBold });
        page.drawLine({
          start: { x: startX, y: positionY - 5 },
          end: { x: startX + columnWidths.reduce((a, b) => a + b), y: positionY - 5 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        positionY -= lineHeight;

        const Against_month_of_value = row.Against_month_of != undefined || null || ''? row.Against_month_of.toString() : '0.0';
        const Rent_Amount_value = row.Rent_Amount != undefined || null || ''? row.Rent_Amount.toString() : '0.0';

        page.drawText(Against_month_of_value, { x: startX, y: positionY, size: regularFontSize, font });
        page.drawText(Rent_Amount_value, {
          x: startX + columnWidths[0],
          y: positionY,
          size: regularFontSize,
        });
        positionY -= lineHeight;
        page.drawLine({
          start: { x: startX, y: positionY + lineHeight - 5 },
          end: { x: startX + columnWidths.reduce((a, b) => a + b), y: positionY + lineHeight - 5 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });


        // Draw the " Outstandings" header
        page.drawText('Outstandings:', {
          x: startX + 150 , // Adjust x position if necessary
          y: positionY, // Adjust y position based on your layout
          size: headerFontSize, 
          font: fontBold // Bold font for the "Detail" header
        });

        // Make the line longer and thicker (not bold, just a regular line)
        page.drawLine({
          start: { x: startX , y: positionY - 2 }, // Start under "Detail"
          end: { x: startX + 250, y: positionY - 2 }, // Make the line longer (adjust the value)
          thickness: 0.5, // Thicker line (increase as needed)
          color: rgb(0.8, 0.8, 0.8),
        });

        positionY -= lineHeight;
        // Draw table 2  Rent Details
        

        page.drawText('Number of Months', { x: startX , y: positionY, size: headerFontSize, font: fontBold });
        page.drawText('Amount (O.R)', { x: startX + columnWidths[0], y: positionY, size: headerFontSize, font:fontBold });
        page.drawLine({
          start: { x: startX, y: positionY - 5 },
          end: { x: startX + columnWidths.reduce((a, b) => a + b), y: positionY - 5 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        positionY -= lineHeight;

        const Number_of_Months_value = row.Number_of_Months != undefined || null || ''? row.Number_of_Months.toString() : '0.0';
        const Amount_value = row.Amount != undefined || null || ''? row.Amount.toString() : '0.0';

        page.drawText(Number_of_Months_value, { x: startX, y: positionY, size: regularFontSize, font });
        page.drawText(Amount_value, {
          x: startX + columnWidths[0],
          y: positionY,
          size: regularFontSize,
        });
        positionY -= lineHeight;
        page.drawLine({
          start: { x: startX, y: positionY + lineHeight - 5 },
          end: { x: startX + columnWidths.reduce((a, b) => a + b), y: positionY + lineHeight - 5 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        positionY -= lineHeight;

        // Total Amount        
        const Total_Amount_value = row.Total_Amount != undefined || null || ''? row.Total_Amount.toString() : '0.0';

        page.drawText('Total Amount (O.R)', { x: startX , y: positionY, size: headerFontSize, font: fontBold });
        page.drawText(Total_Amount_value, { x: startX + columnWidths[0], y: positionY, size: headerFontSize, font:fontBold });
        page.drawLine({
          start: { x: startX, y: positionY - 5 },
          end: { x: startX + columnWidths.reduce((a, b) => a + b), y: positionY - 5 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });

        //footer
        positionY -= lineHeight;
        positionY -= lineHeight;
        positionY -= lineHeight;
        page.drawText('•    For payment, please transfer to the following A/C:', { x: startX , y: positionY, size: headerFontSize, font });
        positionY -= lineHeight;
        page.drawText('     Madinat Sandan LLC.', { x: startX , y: positionY, size: headerFontSize, font });
        positionY -= lineHeight;
        page.drawText('     Account No: 0423055371640032 ,', { x: startX , y: positionY, size: headerFontSize, font });
        positionY -= lineHeight;
        page.drawText('     Bank Muscat, Corporate Branch.', { x: startX , y: positionY, size: headerFontSize, font });
        // Footer
        positionY -= lineHeight;
        positionY -= lineHeight;
        page.drawText('Thank you for your business!', { x: startX , y: positionY, size: headerFontSize, font });

        // Draw the " Outstandings" header
        // page.drawText(' Outstandings:', {
        //   x: startX + 150 , // Adjust x position if necessary
        //   y: positionY, // Adjust y position based on your layout
        //   size: headerFontSize, 
        //   font: fontBold // Bold font for the "Detail" header
        // });

        // // Make the line longer and thicker (not bold, just a regular line)
        // page.drawLine({
        //   start: { x: startX , y: positionY - 2 }, // Start under "Detail"
        //   end: { x: startX + 250, y: positionY - 2 }, // Make the line longer (adjust the value)
        //   thickness: 0.5, // Thicker line (increase as needed)
        //   color: rgb(0.8, 0.8, 0.8),
        // });

        // positionY -= lineHeight;

        // // Draw table 2  Rent Details
        // const tableThreeStartY = 570;
        // const tableThreeStartX = 50;

        // page.drawText('Number of Months', { x: startX, y: tableThreeStartY, size: headerFontSize, font, color: rgb(0.2, 0.2, 0.7) });
        // page.drawText(' Amount (O.R)', { x: startX + columnWidths[0], y: tableThreeStartY, size: headerFontSize, font, color: rgb(0.2, 0.2, 0.7) });
        // page.drawLine({
        //   start: { x: startX, y: tableThreeStartY - 5 },
        //   end: { x: startX + columnWidths.reduce((a, b) => a + b), y: tableThreeStartY - 5 },
        //   thickness: 1,
        //   color: rgb(0, 0, 0),
        // });

        // const Number_of_Months_value = row.Number_of_Months != undefined || null || ''? row.Number_of_Months.toString() : '0.0';
        // const Amount_value = row.Amount != undefined || null || ''? row.Amount.toString() : '0.0';
        // page.drawText(Number_of_Months_value, { x: startX, y: tableThreeStartY, size: regularFontSize, font });
        // page.drawText(Amount_value, {
        //   x: startX + columnWidths[0],
        //   y: tableThreeStartY,
        //   size: regularFontSize,
        // });
        // positionY -= lineHeight;

        // //Total Amount (O.R)
        // const Total_Amount_value = row.Total_Amount != undefined || null || ''? row.Total_Amount.toString() : '0.0';
        // page.drawText(` Total Amount (O.R):     ${Total_Amount_value}`, {
        //   x: startX + 150 , // Adjust x position if necessary
        //   y: positionY, // Adjust y position based on your layout
        //   size: headerFontSize, 
        //   font: fontBold // Bold font for the "Detail" header
        // });

        // Save PDF and prepare for sending
        const pdfBytes = await pdfDoc.save();
        const base64Pdf = Buffer.from(pdfBytes).toString('base64');

        // Sending via UltraMSG API
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();

        const urlencoded = new URLSearchParams();
        urlencoded.append('token', 'ye55z7mgbjpfe3gw');
        urlencoded.append('to', '968' + row.Contact);
        urlencoded.append('body', 'Intaj Notify App');
        urlencoded.append('filename', `${formattedDate}.pdf`);
        urlencoded.append('document', base64Pdf);

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded,
          redirect: 'follow',
        };

        const response = await fetch('https://api.ultramsg.com/instance97367/messages/document', requestOptions);
        const result = await response.json();

        console.log('UltraMSG API Response:', result);

        if (result.error) {
          throw new Error(`UltraMSG API Error: ${result.error}`);
        }
        
        log.push({ contact: row.Contact, status: 'Sent' });

        if (result.message === 'ok' && result.sent === 'true') {
          await db.collection('sheet_details_rent_receivables').deleteOne({ _id: new ObjectId(String(row._id)) });
        } else {
          throw new Error('Message not sent');
        }
      } catch (error) {
        console.error('Error sending message to:', row.Contact, error);
        log.push({ contact: row.Contact, status: 'Failed', error: error.message });
      }
    }

    return NextResponse.json({ message: 'Messages processed', log });
  } catch (error) {
    console.error('Error generating or sending PDF:', error);
    return NextResponse.json({ message: 'Failed to generate and send PDF', error: error.message }, { status: 500 });
  }
}
