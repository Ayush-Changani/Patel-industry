import api from "../../services/axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/patel_lindustry_logo.png";

const formatCurrency = (val) => {
  const num = Number(val);
  return isNaN(num)
    ? "0.00"
    : num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).split("/").reverse().join("-");
};

export const downloadPurchaseInvoicePDF = async (pinv_id) => {
  try {
    // 1. Fetch data
    const headerRes = await api.get("/i_pi_purchase_invoice_select_all_and_id", { 
      params: { pinv_id, pi_id: pinv_id } 
    });
    const itemsRes = await api.get("/i_pi_purchase_invoice_items_select", { 
      params: { pinv_id, pi_id: pinv_id } 
    });
    
    const header = headerRes.data?.Result?.[0];
    const items = itemsRes.data?.Result || [];

    if (!header) {
      console.error("No header data found");
      return;
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.pinv_i_amount || 0), 0);
    const totalGST = items.reduce((sum, item) => sum + ((item.pinv_i_cgst || 0) + (item.pinv_i_sgst || 0) + (item.pinv_i_igst || 0)), 0);
    const grandTotal = items.reduce((sum, item) => sum + (item.pinv_i_total || 0), 0);
    const logoUrl = logo ;

    // 2. Create the Element with fixed height for proper rendering
    const element = document.createElement("div");
    element.id = "pdf-content-" + Date.now();
    
    Object.assign(element.style, {
      width: "210mm", 
      height: "297mm",
      padding: "20mm",
      position: "fixed",
      left: "-9999px",
      top: "0",
      background: "white",
      color: "#000",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box"
    });

    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.4; font-size: 12px;">
        
        <!-- Header with Logo and Title -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #C29A4B; padding-bottom: 15px; margin-bottom: 15px;">
        <div style="display: flex; flex-direction: column; align-items: flex-start;">
  
        <img 
            src="${logoUrl}" 
            alt="Logo" 
            style="height: 98px; object-fit: contain;"
            crossOrigin="anonymous"
        />

        <div style="
            font-size: 14px;
            font-weight: bold;
            color: #C29A4B;
            letter-spacing: 1px;
            text-transform: uppercase;
        ">
            Patel Industry
        </div>

        </div>
          <div style="text-align: right; font-size: 20px; font-weight: bold; color: #222831;">
            Purchase Invoice
          </div>
        </div>

        <!-- Company & Invoice Details Row -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 10px;">
          <!-- Left: Company Info -->
          <div style="width: 45%;">
            <div style="font-weight: bold; color: #222831; margin-bottom: 3px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">
              GSTIN: 24PQPK6X54/BUZ2
            </div>
            <div style="color: #666; line-height: 1.4;">
              Gondal Road, Rajkot, Gujarat
            </div>
          </div>

          <!-- Right: GRN & Invoice Status -->
          <div style="width: 45%; text-align: right;">
            <div style="display: inline-block; background: #E8F5E9; color: #2E7D32; padding: 3px 6px; border-radius: 3px; font-weight: bold; font-size: 9px; margin-bottom: 5px;">
              ✓ Verified
            </div>
            <div style="margin-top: 3px; font-weight: bold; color: #222831; font-size: 10px;">
              GRN : ${header.grn_number || "N/A"}
            </div>
          </div>
        </div>

        <!-- Vendor & Invoice Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px 0; font-size: 10px;">
          
          <!-- Vendor Details -->
          <div style="width: 48%;">
            <div style="font-weight: bold; color: #666; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Vendor</div>
            <div style="font-weight: bold; color: #222831; margin-bottom: 2px; font-size: 10px;">${header.vendor_name || "N/A"}</div>
            <div style="color: #666; font-size: 9px;">${header.vendor_address || "Gondal Road, Rajkot, Gujarat"}</div>
          </div>

          <!-- Invoice Details -->
          <div style="width: 48%; text-align: right;">
            <table style="width: 100%; font-size: 9px;">
              <tr>
                <td style="text-align: right; font-weight: bold; color: #666; width: 50%;">Invoice:</td>
                <td style="background: #F5F5F5; padding: 2px 4px; font-weight: bold; color: #222831;">PI-${header.invoice_number || "N/A"}</td>
              </tr>
              <tr>
                <td style="text-align: right; font-weight: bold; color: #666;">Date:</td>
                <td style="background: #F5F5F5; padding: 2px 4px; font-weight: bold; color: #222831;">${formatDate(header.invoice_date)}</td>
              </tr>
              <tr>
                <td style="text-align: right; font-weight: bold; color: #666;">Due:</td>
                <td style="background: #F5F5F5; padding: 2px 4px; font-weight: bold; color: #222831;">${formatDate(header.due_date)}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
          <thead>
            <tr style="background: #666; color: #DFD0B8;">
              <th style="padding: 6px 4px; text-align: left; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; width: 5%; border: 1px solid #222831;">#</th>
              <th style="padding: 6px 4px; text-align: left; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; width: 35%; border: 1px solid #222831;">Description</th>
              <th style="padding: 6px 4px; text-align: center; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; width: 10%; border: 1px solid #222831;">HSN</th>
              <th style="padding: 6px 4px; text-align: center; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; width: 8%; border: 1px solid #222831;">Qty</th>
              <th style="padding: 6px 4px; text-align: center; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; width: 8%; border: 1px solid #222831;">Unit</th>
              <th style="padding: 6px 4px; text-align: right; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; width: 12%; border: 1px solid #222831;">Rate</th>
              <th style="padding: 6px 4px; text-align: right; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; width: 12%; border: 1px solid #222831;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr style="border-bottom: 1px solid #E0E0E0; background: ${idx % 2 === 0 ? '#F9F9F9' : '#FFFFFF'};">
                <td style="padding: 5px 4px; text-align: center; font-weight: bold; color: #999; border: 1px solid #ddd;">${idx + 1}</td>
                <td style="padding: 5px 4px; text-align: left; color: #222831; border: 1px solid #ddd;">${item.itm_item_name || "N/A"}</td>
                <td style="padding: 5px 4px; text-align: center; color: #666; border: 1px solid #ddd;">2402</td>
                <td style="padding: 5px 4px; text-align: center; font-weight: bold; color: #222831; border: 1px solid #ddd;">${item.pinv_i_quantity || 0}</td>
                <td style="padding: 5px 4px; text-align: center; color: #666; border: 1px solid #ddd;">Nos</td>
                <td style="padding: 5px 4px; text-align: right; font-weight: bold; color: #222831; border: 1px solid #ddd;">₹ ${formatCurrency(item.pinv_i_rate || 0)}</td>
                <td style="padding: 5px 4px; text-align: right; font-weight: bold; color: #222831; border: 1px solid #ddd;">₹ ${formatCurrency(item.pinv_i_amount || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary Section -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
          <div style="width: 50%;">
            <div style="font-size: 10px; border: 1px solid #DDD; padding: 10px; background: #FFFAEB; border-radius: 3px;">
              
              <div style="margin-bottom: 6px; display: flex; justify-content: space-between; border-bottom: 1px solid #E0E0E0; padding-bottom: 4px;">
                <span style="color: #666;">Subtotal</span>
                <span style="font-weight: bold; color: #222831;">₹ ${formatCurrency(subtotal)}</span>
              </div>
              <div style="margin-bottom: 6px; display: flex; justify-content: space-between; border-bottom: 1px solid #E0E0E0; padding-bottom: 4px;">
                <span style="color: #666;">GST</span>
                <span style="font-weight: bold; color: #2E7D32;">+ ₹ ${formatCurrency(totalGST)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 4px;">
                <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666;">Total</span>
                <span style="font-size: 14px; font-weight: bold; color: #222831;">₹ ${formatCurrency(grandTotal)}</span>
              </div>

            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 9px; color: #999; margin-top: 20px; padding-top: 10px; border-top: 1px solid #DDD;">
          <div style="margin-bottom: 4px;">System Generated Invoice</div>
          <div>Thank you for your business</div>
        </div>

      </div>
    `;

    document.body.appendChild(element);

    // 3. Wait for rendering and then capture
    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Capture as image
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowHeight: element.scrollHeight,
      windowWidth: element.scrollWidth
    });

    // 5. Create PDF from canvas
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
    // Download
    pdf.save(`PI_${header.invoice_number}.pdf`);

    // Clean up
    document.body.removeChild(element);

  } catch (error) {
    console.error("PDF Export failed:", error);
    throw error;
  }
};