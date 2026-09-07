using Backend.Purchase.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;  
//using static Backend.Purchase.Controller.Controller_Purchase_Inquiry;

namespace Backend.Purchase.Controller
{
    [ApiController]
    public class Controller_purchase_invoice : ControllerBase
    {

        #region RESPONSE MODEL
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }
        #endregion



        #region DTO

        public class PurchaseInvoiceDTO
        {
            public int pinv_id { get; set; }
            public string pinv_number { get; set; }
            public DateTime pinv_date { get; set; }
            public int pinv_po_id { get; set; }
            public int pinv_grn_id { get; set; }
            public int pinv_vendor_id { get; set; }
            public DateTime pinv_due_date { get; set; }
            public decimal pinv_total_amount { get; set; }
            public string pinv_status { get; set; }
            public int pinv_created_by_user_id { get; set; }
            public string pinv_rejection_remarks { get; set; }
            public int pinv_approved_by_user_id { get; set; }

            public List<PurchaseInvoiceItemDTO> items { get; set; }
        }


        public class PurchaseInvoiceItemDTO
        {
            public int pinv_i_id { get; set; }
            public int pinv_i_item_id { get; set; }
            public decimal pinv_i_quantity { get; set; }
            public decimal pinv_i_rate { get; set; }
            public decimal pinv_i_amount { get; set; }
            public decimal pinv_i_cgst { get; set; }
            public decimal pinv_i_sgst { get; set; }
            public decimal pinv_i_igst { get; set; }
            public decimal pinv_i_total { get; set; }
            public string pinv_i_remarks { get; set; } 
        }

        public class PurchaseInvoiceApprovalDTO
        {
            public int pinv_id { get; set; }
            public string action { get; set; }              // "Approved", "Rejected", or "SendBack"
            public int approved_by_user_id { get; set; }   // Now matches parameter name in common SP
            public string pinv_rejection_remarks { get; set; } // Now matches PI field naming
        }

        #endregion



        // ============================================================
        // INSERT / UPDATE
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_invoice_insert_update")]
        public IActionResult i_pi_purchase_invoice_insert_update([FromBody] PurchaseInvoiceDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Purchase_Invoice.i_pi_purchase_invoice_insert_update(
                    model.pinv_id,
                    model.pinv_number,
                    model.pinv_date,
                    model.pinv_po_id,
                    model.pinv_grn_id,
                    model.pinv_vendor_id,
                    model.pinv_due_date,
                    model.pinv_total_amount,
                    model.pinv_status,
                    model.pinv_created_by_user_id,
                    model.pinv_rejection_remarks,
                    model.pinv_approved_by_user_id
                );


                int purchase_invoice_id = Convert.ToInt32(dt.Rows[0]["purchase_invoice_id"]);


                DataTable itemTable = new DataTable();

                itemTable.Columns.Add("pinv_i_id", typeof(int));
                itemTable.Columns.Add("pinv_i_item_id", typeof(int));
                itemTable.Columns.Add("pinv_i_quantity", typeof(decimal));
                itemTable.Columns.Add("pinv_i_rate", typeof(decimal));
                itemTable.Columns.Add("pinv_i_amount", typeof(decimal));
                itemTable.Columns.Add("pinv_i_cgst", typeof(decimal));
                itemTable.Columns.Add("pinv_i_sgst", typeof(decimal));
                itemTable.Columns.Add("pinv_i_igst", typeof(decimal));
                itemTable.Columns.Add("pinv_i_total", typeof(decimal));
                itemTable.Columns.Add("pinv_i_remarks", typeof(string));


                if (model.items != null)
                {
                    foreach (var item in model.items)
                    {
                        itemTable.Rows.Add(
                            item.pinv_i_id,
                            item.pinv_i_item_id,
                            item.pinv_i_quantity,
                            item.pinv_i_rate,
                            item.pinv_i_amount,
                            item.pinv_i_cgst,
                            item.pinv_i_sgst,
                            item.pinv_i_igst,
                            item.pinv_i_total,
                            item.pinv_i_remarks ?? ""
                        );
                    }
                }


                BAL_Purchase_Invoice.i_pi_purchase_invoice_items_save(
                    purchase_invoice_id,
                    itemTable
                );


                response.Status = 1;
                response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
                response.Result = purchase_invoice_id;

                return Ok(response);

            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;

                return Ok(response);
            }
        }

        // ============================================================
        //  GET NEXT Invoice NUMBER
        //  Route  : GET /i_pi_purchase_invoice_generate_number
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_invoice_generate_number")]
        public IActionResult i_pi_purchase_invoice_generate_number()
            {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Invoice.i_pi_purchase_invoice_generate_number();
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Invoice number fetched successfully.";
                    response.Result = Convert.ToInt32(dt.Rows[0]["Result"]);
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    response.Result = null;
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ============================================================
        // LIST
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_invoice_select_all_and_id")]
        public IActionResult i_pi_purchase_invoice_select_all_and_id(int pinv_id)
        {
            Msg response = new Msg();

            DataTable dt = BAL_Purchase_Invoice
                .i_pi_purchase_invoice_select_all_and_id(pinv_id);

            response.Status = 1;
            response.Result = dt;

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }



        // ============================================================
        // ITEMS
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_invoice_items_select")]
        public IActionResult i_pi_purchase_invoice_items_select(int pinv_id)
        {
            Msg response = new Msg();

            DataTable dt = BAL_Purchase_Invoice
                .i_pi_purchase_invoice_items_select(pinv_id);

            response.Status = 1;
            response.Result = dt;

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }



        // ============================================================
        // DELETE
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_invoice_delete")]
        public IActionResult i_pi_purchase_invoice_delete(int id)
        {
            Msg response = new Msg();

            DataTable dt = BAL_Purchase_Invoice
                .i_pi_purchase_invoice_delete(id);

            response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
            response.Message = Convert.ToString(dt.Rows[0]["status_message"]);

            return Ok(response);
        }



        // ============================================================
        // GRN DROPDOWN
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_grn_by_po_id")]
        public IActionResult i_pi_get_grn_by_po_id(int po_id)
        {
            Msg response = new Msg();

            DataTable dt = BAL_Purchase_Invoice
                .i_pi_get_grn_by_po_id(po_id);

            response.Status = 1;
            response.Result = dt;

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }



        // ============================================================
        // GRN ITEMS GRID
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_grn_items_by_grn_id")]
        public IActionResult i_pi_get_grn_items_by_grn_id(int grn_id)
        {
            Msg response = new Msg();

            DataTable dt = BAL_Purchase_Invoice
                .i_pi_get_grn_items_by_grn_id(grn_id);

            response.Status = 1;
            response.Result = dt;

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ============================================================
        //  APPROVAL ACTION  (Approve / Reject / SendBack)
        //  Route  : POST /i_pi_purchase_inquiry_approval_action
        //  Called : From PINV List page Approve / Reject button
        //  Uses   : Centralized i_pi_common_approval_action stored proc
        //  Action : "Approved" | "Rejected" | "SendBack"
        //  Returns: Status 1 = Success | Status 0 = Failure
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_invoice_approval_action")]
        public IActionResult i_pi_purchase_invoice_approval_action(
            [FromBody] PurchaseInvoiceApprovalDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                // ── Validation ──────────────────────────────────────
                if (model == null || model.pinv_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PINV ID.";
                    return Ok(response);
                }

                if (string.IsNullOrWhiteSpace(model.action))
                {
                    response.Status = 0;
                    response.Message = "Action must be provided (Approved, Rejected, or SendBack).";
                    return Ok(response);
                }

                if (model.approved_by_user_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid approver user ID.";
                    return Ok(response);
                }

                if (model.action == "Rejected" && string.IsNullOrWhiteSpace(model.pinv_rejection_remarks))
                {
                    response.Status = 0;
                    response.Message = "Rejection remarks are required.";
                    return Ok(response);
                }

                // ── Get PI number for history log ────────────────────
                DataTable dtPI = BAL_Purchase_Invoice.i_pi_purchase_invoice_select_all_and_id(model.pinv_id);
                string pinv_number = "";
                if (dtPI != null && dtPI.Rows.Count > 0)
                {
                    pinv_number = Convert.ToString(dtPI.Rows[0]["invoice_number"]) ?? "";
                }

                // ── Call common approval SP ──────────────────────────
                DataTable dt = BAL_Purchase_Invoice.i_pi_common_approval_action(
                    "PurchaseInvoice",
                    model.pinv_id,
                    pinv_number,
                    model.action,
                    model.approved_by_user_id,
                    model.pinv_rejection_remarks ?? ""
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                int status_flag = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                string status_message = Convert.ToString(dt.Rows[0]["status_message"]);

                response.Status = status_flag;
                response.Message = status_message;
                response.Result = null;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = "Internal server error: " + ex.Message;
                response.Result = null;
                return Ok(response);
            }
        }
    }
}