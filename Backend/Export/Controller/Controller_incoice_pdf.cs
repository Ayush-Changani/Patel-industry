using Backend.Export.BAl;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;

namespace Backend.Export.Controller
{
    [ApiController]
    public class Controller_incoice_pdf : ControllerBase
    {
        #region COMMON RESPONSE MODEL
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }
        #endregion

        #region GET INVOICE PDF DATA
        [HttpGet]
        [Route("i_pi_generate_pdf_for_invoice")]
        public IActionResult i_pi_generate_pdf_for_invoice([FromQuery] int pinv_id)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Invoice_pdf.i_pi_generate_pdf_for_invoice(pinv_id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    var header = dt.Rows[0];

                    var items = dt.AsEnumerable()
                        .Where(x => x["pinv_i_id"] != DBNull.Value)
                        .Select((x, index) => new
                        {
                            id = index + 1,
                            description = x["itm_item_name"]?.ToString(),
                            hsn = x["itm_hsn_code"]?.ToString(),
                            qty = x["pinv_i_quantity"] != DBNull.Value ? Convert.ToDecimal(x["pinv_i_quantity"]) : 0,
                            unit = "Nos",
                            rate = x["pinv_i_rate"] != DBNull.Value ? Convert.ToDecimal(x["pinv_i_rate"]) : 0,
                            amount = x["pinv_i_amount"] != DBNull.Value ? Convert.ToDecimal(x["pinv_i_amount"]) : 0,
                            cgst = x["pinv_i_cgst"] != DBNull.Value ? Convert.ToDecimal(x["pinv_i_cgst"]) : 0,
                            sgst = x["pinv_i_sgst"] != DBNull.Value ? Convert.ToDecimal(x["pinv_i_sgst"]) : 0,
                            igst = x["pinv_i_igst"] != DBNull.Value ? Convert.ToDecimal(x["pinv_i_igst"]) : 0,
                            total = x["pinv_i_total"] != DBNull.Value ? Convert.ToDecimal(x["pinv_i_total"]) : 0
                        }).ToList();

                    var result = new
                    {
                        invoiceNumber = header["pinv_number"]?.ToString(),
                        invoiceDate = header["pinv_date"] != DBNull.Value
                            ? Convert.ToDateTime(header["pinv_date"]).ToString("dd-MM-yyyy")
                            : "",
                        dueDate = header["pinv_due_date"] != DBNull.Value
                            ? Convert.ToDateTime(header["pinv_due_date"]).ToString("dd-MM-yyyy")
                            : "",
                        total = header["pinv_total_amount"] != DBNull.Value
                            ? Convert.ToDecimal(header["pinv_total_amount"])
                            : 0,

                        vendorName = header["vc_vendor_name"]?.ToString(),
                        vendorLocation = header["vc_vendor_address"]?.ToString(),
                        gstin = header["vc_gst_number"]?.ToString(),

                        grnNumber = header["grn_number"]?.ToString(),
                        grnDate = header["grn_date"] != DBNull.Value
                            ? Convert.ToDateTime(header["grn_date"]).ToString("dd-MM-yyyy")
                            : "",

                        items = items
                    };

                    response.Status = 1;
                    response.Message = "Success";
                    response.Result = result;

                    return Ok(response);  
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No data found";
                    response.Result = null;

                    return Ok(response);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new Msg
                {
                    Status = 0,
                    Message = ex.Message
                });
            }
        }
        #endregion
    }
}