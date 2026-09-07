using Backend.Purchase.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace Backend.Purchase.Controller
{
    [ApiController]
    public class Controller_Purchase_Inquiry : ControllerBase
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

        // ── PI Header DTO ──
        public class PurchaseInquiryDTO
        {
            public int pi_id { get; set; }
            public string pi_number { get; set; }
            public int pi_pr_id { get; set; }
            public int pi_entity_id { get; set; }
            public int pi_entity_group_id { get; set; }
            public int pi_department_id { get; set; }
            public DateTime pi_expected_delivery_date { get; set; }
            public string pi_terms_conditions { get; set; }
            public string pi_remarks { get; set; }
            public int pi_prepared_by_user_id { get; set; }
            public string pi_status { get; set; }

            // Item rows — sent from item repeater grid
            public List<PurchaseInquiryItemDTO> items { get; set; }

            // Vendor rows — sent from vendor grid
            public List<PurchaseInquiryVendorDTO> vendors { get; set; }
        }

        // ── PI Item DTO ──
        public class PurchaseInquiryItemDTO
        {
            public int pii_pr_item_id { get; set; }
            public int pii_item_id { get; set; }
            public decimal pii_quantity { get; set; }
            public string pii_item_remarks { get; set; }
        }

        // ── PI Vendor DTO ──
        public class PurchaseInquiryVendorDTO
        {
            public int piv_vendor_id { get; set; }
            public string piv_remarks { get; set; }
        }

        // ── UPDATED: Common Approval DTO (matches PR) ──
        public class PurchaseInquiryApprovalDTO
        {
            public int pi_id { get; set; }
            public string action { get; set; }              // "Approved", "Rejected", or "SendBack"
            public int approved_by_user_id { get; set; }   // Now matches parameter name in common SP
            public string pi_rejection_remarks { get; set; } // Now matches PI field naming
        }

        #endregion


        // ============================================================
        //  GET NEXT PI NUMBER
        //  Route  : GET /i_pi_get_next_pi_number
        //  Called : When PI form loads in Add mode
        //  Returns: Next sequence number as integer
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_next_pi_number")]
        public IActionResult i_pi_get_next_pi_number()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Inquiry.i_pi_get_next_pi_number();
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "PI number fetched successfully.";
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
        //  GET APPROVED PR DDL
        //  Route  : GET /i_pi_get_approved_pr_ddl
        //  Called : PI form — PR dropdown (Add mode)
        //  Returns: Only Approved PRs with entity & department info
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_approved_pr_ddl")]
        public IActionResult i_pi_get_approved_pr_ddl([FromQuery] string SearchTerm)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Inquiry.i_pi_get_approved_pr_ddl(SearchTerm ?? "");
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Data fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No approved PRs found.";
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
        //  GET VENDOR DDL
        //  Route  : GET /i_pi_get_vendor_ddl
        //  Called : PI form — vendor dropdown in vendor grid
        //  Returns: Active vendors with contact person and phone
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_vendor_ddl")]
        public IActionResult i_pi_get_vendor_ddl([FromQuery] string SearchTerm)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Inquiry.i_pi_get_vendor_ddl(SearchTerm ?? "");
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Data fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No vendors found.";
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
        //  GET PR ITEMS BY PR ID
        //  Route  : GET /i_pi_purchase_requisition_items_select_by_master
        //  Called : PI form — when a PR is selected, auto-load items
        //  Returns: All item rows under that PR with name, UOM, qty
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_requisition_items_select_by_master")]
        public IActionResult i_pi_purchase_requisition_items_select_by_master(
            [FromQuery] int pr_id
        )
        {
            Msg response = new Msg();
            try
            {
                if (pr_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PR ID.";
                    response.Result = null;
                    return Ok(response);
                }

                DataTable dt = BAL_Purchase_Inquiry.i_pi_purchase_requisition_items_select_by_master(pr_id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Data fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No items found for this PR.";
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
        //  INSERT / UPDATE PI  (Header + Items + Vendors)
        //  Route  : POST /i_pi_purchase_inquiry_insert_update
        //  Called : On Save Draft or Send to Vendors from PI form
        //  Flow   :
        //    Step 1 → Insert or update PI header
        //    Step 2 → If edit, hard delete old item rows first
        //    Step 3 → Loop items list, insert one row per item
        //    Step 4 → If edit, hard delete old vendor rows first
        //    Step 5 → Loop vendors list, insert one row per vendor
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_inquiry_insert_update")]
        public IActionResult i_pi_purchase_inquiry_insert_update(
            [FromBody] PurchaseInquiryDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                // ── Basic validation ────────────────────────────────
                if (model == null)
                {
                    response.Status = 0;
                    response.Message = "Invalid request payload.";
                    return Ok(response);
                }

                if (model.pi_pr_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Please select a valid Purchase Requisition.";
                    return Ok(response);
                }

                if (model.items == null || model.items.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "At least one item is required.";
                    return Ok(response);
                }

                if (model.vendors == null || model.vendors.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "At least one vendor is required.";
                    return Ok(response);
                }

                // Step 1 — Insert or update PI header ────────────────
                DataTable dt = BAL_Purchase_Inquiry.i_pi_purchase_inquiry_insert_update(
                    model.pi_id,
                    model.pi_number,
                    model.pi_pr_id,
                    model.pi_entity_id,
                    model.pi_entity_group_id,
                    model.pi_department_id,
                    model.pi_expected_delivery_date,
                    model.pi_terms_conditions ?? "",
                    model.pi_remarks ?? "",
                    model.pi_prepared_by_user_id,
                    model.pi_status
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                int status_flag = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                string status_message = Convert.ToString(dt.Rows[0]["status_message"]);
                int purchase_inquiry_id = Convert.ToInt32(dt.Rows[0]["purchase_inquiry_id"]);

                if (status_flag == 0)
                {
                    response.Status = 0;
                    response.Message = status_message;
                    return Ok(response);
                }

                // Step 2 — If edit, hard delete old item rows first ──
                if (model.pi_id > 0)
                {
                    BAL_Purchase_Inquiry.i_pi_purchase_inquiry_item_delete_by_master(
                        purchase_inquiry_id
                    );
                }

                // Step 3 — Insert each item row from item grid ────────
                foreach (PurchaseInquiryItemDTO item in model.items)
                {
                    if (item.pii_item_id <= 0 || item.pii_quantity <= 0)
                        continue;

                    BAL_Purchase_Inquiry.i_pi_purchase_inquiry_item_insert(
                        purchase_inquiry_id,
                        item.pii_pr_item_id,
                        item.pii_item_id,
                        item.pii_quantity,
                        item.pii_item_remarks ?? ""
                    );
                }

                // Step 4 — If edit, hard delete old vendor rows first ─
                if (model.pi_id > 0)
                {
                    BAL_Purchase_Inquiry.i_pi_purchase_inquiry_vendor_delete_by_master(
                        purchase_inquiry_id
                    );
                }

                // Step 5 — Insert each vendor row from vendor grid ────
                foreach (PurchaseInquiryVendorDTO vendor in model.vendors)
                {
                    if (vendor.piv_vendor_id <= 0)
                        continue;

                    BAL_Purchase_Inquiry.i_pi_purchase_inquiry_vendor_insert(
                        purchase_inquiry_id,
                        vendor.piv_vendor_id,
                        vendor.piv_remarks ?? ""
                    );
                }

                response.Status = 1;
                response.Message = status_message;
                response.Result = new { purchase_inquiry_id };
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
        //  SELECT ALL PI HEADERS / SELECT BY ID
        //  Route  : GET /i_pi_purchase_inquiry_select_all_and_id
        //  Called : List page (pi_id = 0) or form load (pi_id > 0)
        //  Returns: PI header rows with all joined display names
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_inquiry_select_all_and_id")]
        public IActionResult i_pi_purchase_inquiry_select_all_and_id(
            [FromQuery] int pi_id
        )
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Inquiry.i_pi_purchase_inquiry_select_all_and_id(pi_id);
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
        //  SELECT PI ITEMS BY MASTER ID
        //  Route  : GET /i_pi_purchase_inquiry_items_select_by_master
        //  Called : Form load for edit or view mode
        //  Returns: All item rows for that PI
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_inquiry_items_select_by_master")]
        public IActionResult i_pi_purchase_inquiry_items_select_by_master(
            [FromQuery] int pi_id
        )
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Inquiry.i_pi_purchase_inquiry_items_select_by_master(pi_id);
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
        //  SELECT PI VENDORS BY MASTER ID
        //  Route  : GET /i_pi_purchase_inquiry_vendors_select_by_master
        //  Called : Form load for edit or view mode
        //  Returns: All vendor rows for that PI
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_inquiry_vendors_select_by_master")]
        public IActionResult i_pi_purchase_inquiry_vendors_select_by_master(
            [FromQuery] int pi_id
        )
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Inquiry.i_pi_purchase_inquiry_vendors_select_by_master(pi_id);
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
        //  APPROVAL ACTION  (Approve / Reject / SendBack)
        //  Route  : POST /i_pi_purchase_inquiry_approval_action
        //  Called : From PI List page Approve / Reject button
        //  Uses   : Centralized i_pi_common_approval_action stored proc
        //  Action : "Approved" | "Rejected" | "SendBack"
        //  Returns: Status 1 = Success | Status 0 = Failure
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_inquiry_approval_action")]
        public IActionResult i_pi_purchase_inquiry_approval_action(
            [FromBody] PurchaseInquiryApprovalDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                // ── Validation ──────────────────────────────────────
                if (model == null || model.pi_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PI ID.";
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

                if (model.action == "Rejected" && string.IsNullOrWhiteSpace(model.pi_rejection_remarks))
                {
                    response.Status = 0;
                    response.Message = "Rejection remarks are required.";
                    return Ok(response);
                }

                // ── Get PI number for history log ────────────────────
                DataTable dtPI = BAL_Purchase_Inquiry.i_pi_purchase_inquiry_select_all_and_id(model.pi_id);
                string pi_number = "";
                if (dtPI != null && dtPI.Rows.Count > 0)
                {
                    pi_number = Convert.ToString(dtPI.Rows[0]["purchase_inquiry_number"]) ?? "";
                }

                // ── Call common approval SP ──────────────────────────
                DataTable dt = BAL_Purchase_Inquiry.i_pi_common_approval_action(
                    "PurchaseInquiry",
                    model.pi_id,
                    pi_number,
                    model.action,
                    model.approved_by_user_id,
                    model.pi_rejection_remarks ?? ""
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


        // ============================================================
        //  DELETE PI
        //  Route  : POST /i_pi_purchase_inquiry_delete
        //  Called : From list page delete button
        //  Header → soft delete  |  Items & Vendors → hard delete
        //  Blocks delete if status is Sent, Approved or Closed
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_inquiry_delete")]
        public IActionResult i_pi_purchase_inquiry_delete([FromQuery] int pi_id)
        {
            Msg response = new Msg();
            try
            {
                if (pi_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PI ID.";
                    return Ok(response);
                }

                DataTable dt = BAL_Purchase_Inquiry.i_pi_purchase_inquiry_delete(pi_id);

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