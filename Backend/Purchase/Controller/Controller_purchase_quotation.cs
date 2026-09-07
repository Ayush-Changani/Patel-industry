using Backend.Purchase.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace Backend.Purchase.Controller
{
    [ApiController]
    public class Controller_purchase_quotation : ControllerBase
    {

        #region COMMON RESPONSE MODEL
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }
        #endregion


        #region DTOs

        // ── PQ Header DTO ──
        public class PurchaseQuotationDTO
        {
            public int pq_id { get; set; }
            public string pq_number { get; set; }
            public DateTime pq_date { get; set; }
            public int pq_pr_id { get; set; }
            public string pq_title { get; set; }
            public string pq_notes { get; set; }
            public string pq_status { get; set; }
            public int pq_created_by_user_id { get; set; }

            // Nested vendor quote list
            public List<PurchaseQuotationVendorDTO> vendors { get; set; }
        }

        // ── Vendor Quote DTO ──
        public class PurchaseQuotationVendorDTO
        {
            public int pqv_id { get; set; }
            public int pqv_vendor_id { get; set; }
            public string pqv_quote_number { get; set; }
            public DateTime pqv_quote_date { get; set; }
            public DateTime? pqv_valid_upto { get; set; }
            public int pqv_delivery_days { get; set; }
            public string pqv_payment_terms { get; set; }
            public string pqv_currency { get; set; }
            public string pqv_remarks { get; set; }
            public bool pqv_is_selected { get; set; }
            public bool pqv_is_rejected { get; set; }

            // Items for this vendor
            public List<PurchaseQuotationVendorItemDTO> items { get; set; }
        }

        // ── Vendor Quote Item DTO ──
        public class PurchaseQuotationVendorItemDTO
        {
            public int pqvi_pr_item_id { get; set; }
            public decimal pqvi_unit_price { get; set; }
            public decimal pqvi_gst_percent { get; set; }
            public decimal pqvi_discount_percent { get; set; }
            public string pqvi_remarks { get; set; }
        }

        // ── Approval DTO ──
        public class PurchaseQuotationApprovalDTO
        {
            public int pq_id { get; set; }
            public string action { get; set; }
            public int approved_by_user_id { get; set; }
            public string pq_rejection_remarks { get; set; }
        }

        // ── Finalize DTO ──
        public class PurchaseQuotationFinalizeDTO
        {
            public int pq_id { get; set; }
            public int selected_pqv_id { get; set; }
            public int finalized_by_user_id { get; set; }
        }

        #endregion


        // ============================================================
        //  GET NEXT PQ NUMBER
        //  Route  : GET /i_pi_get_next_pq_number
        //  Called : When PQ comparison form loads in Add mode
        //  Returns: Next sequence number as integer
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_next_pq_number")]
        public IActionResult i_pi_get_next_pq_number()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Quotation.i_pi_get_next_pq_number();

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "PQ number fetched successfully.";
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
        //  INSERT / UPDATE PQ  (Header + Vendors + Items)
        //  Route  : POST /i_pi_purchase_quotation_insert_update
        //  Called : On Save Draft or Submit for Approval
        //  Flow   :
        //    Step 1 → Insert or update PQ header
        //    Step 2 → If edit, delete all old vendor rows (cascade deletes items)
        //    Step 3 → Loop vendors, insert vendor row
        //    Step 4 → Loop vendor items, insert item row
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_quotation_insert_update")]
        public IActionResult i_pi_purchase_quotation_insert_update(
            [FromBody] PurchaseQuotationDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                if (model == null)
                {
                    response.Status = 0;
                    response.Message = "Invalid request payload.";
                    return Ok(response);
                }

                // Step 1 — Insert / update PQ header ─────────────────
                DataTable dt = BAL_Purchase_Quotation.i_pi_purchase_quotation_insert_update(
                    model.pq_id,
                    model.pq_number,
                    model.pq_date,
                    model.pq_pr_id,
                    model.pq_title ?? "",
                    model.pq_notes ?? "",
                    model.pq_status ?? "Draft",
                    model.pq_created_by_user_id
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                int status_flag = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                string status_message = Convert.ToString(dt.Rows[0]["status_message"]);
                int purchase_quotation_id = Convert.ToInt32(dt.Rows[0]["purchase_quotation_id"]);

                if (status_flag == 0)
                {
                    response.Status = 0;
                    response.Message = status_message;
                    return Ok(response);
                }

                // Step 2 — If edit, hard-delete existing vendor + item rows ──
                if (model.pq_id > 0)
                {
                    BAL_Purchase_Quotation.i_pi_purchase_quotation_vendors_delete_by_master(
                        purchase_quotation_id
                    );
                }

                // Step 3 + 4 — Insert each vendor and their items ─────────
                if (model.vendors != null && model.vendors.Count > 0)
                {
                    foreach (var vendor in model.vendors)
                    {
                        // Step 3 — Insert vendor row
                        DataTable vDt = BAL_Purchase_Quotation.i_pi_purchase_quotation_vendor_insert_update(
                            0,  // pqv_id = 0 because we deleted and re-insert
                            purchase_quotation_id,
                            vendor.pqv_vendor_id,
                            vendor.pqv_quote_number ?? "",
                            vendor.pqv_quote_date,
                            vendor.pqv_valid_upto,
                            vendor.pqv_delivery_days,
                            vendor.pqv_payment_terms ?? "",
                            vendor.pqv_currency ?? "INR",
                            vendor.pqv_remarks ?? "",
                            vendor.pqv_is_selected,
                            vendor.pqv_is_rejected
                        );

                        if (vDt == null || vDt.Rows.Count == 0) continue;

                        int new_pqv_id = Convert.ToInt32(vDt.Rows[0]["pqv_id"]);

                        // Step 4 — Insert item rows for this vendor
                        if (vendor.items != null && vendor.items.Count > 0)
                        {
                            foreach (var item in vendor.items)
                            {
                                BAL_Purchase_Quotation.i_pi_purchase_quotation_vendor_item_insert(
                                    new_pqv_id,
                                    item.pqvi_pr_item_id,
                                    item.pqvi_unit_price,
                                    item.pqvi_gst_percent,
                                    item.pqvi_discount_percent,
                                    item.pqvi_remarks ?? ""
                                );
                            }
                        }
                    }
                }

                response.Status = 1;
                response.Message = status_message;
                response.Result = new { purchase_quotation_id };

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return BadRequest(response);
            }
        }


        // ============================================================
        //  SELECT ALL PQ HEADERS  /  SELECT BY ID
        //  Route  : GET /i_pi_purchase_quotation_select_all_and_id
        //  Called : List page (pq_id = 0) or form load (pq_id > 0)
        //  Returns: PQ header rows with joined display names
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_quotation_select_all_and_id")]
        public IActionResult i_pi_purchase_quotation_select_all_and_id(
            [FromQuery] int pq_id
        )
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Quotation.i_pi_purchase_quotation_select_all_and_id(pq_id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Data fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No records found.";
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
        //  SELECT VENDOR QUOTES BY PQ ID
        //  Route  : GET /i_pi_purchase_quotation_vendors_select
        //  Called : On form load in Edit / View mode
        //  Returns: Flat joined rows (vendor + items) for comparison grid
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_quotation_vendors_select")]
        public IActionResult i_pi_purchase_quotation_vendors_select(
            [FromQuery] int pq_id
        )
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Quotation.i_pi_purchase_quotation_vendors_select(pq_id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Vendor quotes fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No vendor quotes found for this PQ.";
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
        //  APPROVAL ACTION  (Approve / Reject)
        //  Route  : POST /i_pi_purchase_quotation_approval_action
        //  Called : When manager clicks Approve or Reject on list page
        //  Returns: Status 1 = Success | Status 0 = Failure
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_quotation_approval_action")]
        public IActionResult i_pi_purchase_quotation_approval_action(
            [FromBody] PurchaseQuotationApprovalDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                if (model == null || model.pq_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PQ ID.";
                    return Ok(response);
                }

                if (string.IsNullOrWhiteSpace(model.action))
                {
                    response.Status = 0;
                    response.Message = "Action must be provided (Approved or Rejected).";
                    return Ok(response);
                }

                if (model.approved_by_user_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid approver user ID.";
                    return Ok(response);
                }

                DataTable dt = BAL_Purchase_Quotation.i_pi_purchase_quotation_approval_action(
                    model.pq_id,
                    model.action,
                    model.approved_by_user_id,
                    model.pq_rejection_remarks ?? ""
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
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


        // ============================================================
        //  FINALIZE QUOTATION — Lock & Select Vendor
        //  Route  : POST /i_pi_purchase_quotation_finalize
        //  Called : When user clicks "Finalize & Select Vendor"
        //  Returns: Status 1 = Success | Status 0 = Failure
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_quotation_finalize")]
        public IActionResult i_pi_purchase_quotation_finalize(
            [FromBody] PurchaseQuotationFinalizeDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                if (model == null || model.pq_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PQ ID.";
                    return Ok(response);
                }

                if (model.selected_pqv_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Please select a vendor before finalizing.";
                    return Ok(response);
                }

                if (model.finalized_by_user_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid user ID.";
                    return Ok(response);
                }

                DataTable dt = BAL_Purchase_Quotation.i_pi_purchase_quotation_finalize(
                    model.pq_id,
                    model.selected_pqv_id,
                    model.finalized_by_user_id
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
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


        // ============================================================
        //  DELETE PQ
        //  Route  : POST /i_pi_purchase_quotation_delete
        //  Called : From list page delete button
        //  Header → soft delete | Vendors + Items → hard delete
        //  Blocks delete if status is Approved or Finalized
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_quotation_delete")]
        public IActionResult i_pi_purchase_quotation_delete([FromQuery] int id)
        {
            Msg response = new Msg();
            try
            {
                if (id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PQ ID.";
                    return Ok(response);
                }

                DataTable dt = BAL_Purchase_Quotation.i_pi_purchase_quotation_delete(id);

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
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