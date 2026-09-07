using Backend.Purchase.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace Backend.Purchase.Controller
{
    [ApiController]
    public class Controller_GRN : ControllerBase
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

        // ── GRN Header DTO ──
        public class GrnDTO
        {
            public int grn_id { get; set; }
            public string grn_number { get; set; }
            public int grn_po_id { get; set; }
            public int grn_vendor_id { get; set; }
            public DateTime grn_received_date { get; set; }
            public string grn_delivery_challan_number { get; set; }
            public int grn_store_location_id { get; set; }
            public string grn_remarks { get; set; }
            public string grn_status { get; set; }
            public int grn_created_by_user_id { get; set; }

            // Nested items
            public List<GrnItemDTO> items { get; set; }
        }

        // ── GRN Item DTO ──
        public class GrnItemDTO
        {
            public int grni_po_item_id { get; set; }
            public int grni_item_id { get; set; }
            public decimal grni_ordered_qty { get; set; }
            public decimal grni_received_qty { get; set; }
            public decimal grni_rejected_qty { get; set; }
            public string grni_discrepancy_notes { get; set; }
            public decimal grni_unit_price { get; set; }
            public decimal grni_gst_percent { get; set; }
        }

        // ── Approval DTO ──
        public class GrnApprovalDTO
        {
            public int grn_id { get; set; }
            public string action { get; set; }
            public int approved_by_user_id { get; set; }
            public string grn_rejection_remarks { get; set; }
        }

        #endregion


        // ============================================================
        //  GET NEXT GRN NUMBER
        //  Route  : GET /i_pi_get_next_grn_number
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_next_grn_number")]
        public IActionResult i_pi_get_next_grn_number()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_GRN.i_pi_get_next_grn_number();
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "GRN number fetched successfully.";
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
        //  PRE-FILL FROM APPROVED PO
        //  Route  : GET /i_pi_grn_prefill_from_po?po_id=xx
        // ============================================================
        [HttpGet]
        [Route("i_pi_grn_prefill_from_po")]
        public IActionResult i_pi_grn_prefill_from_po([FromQuery] int po_id)
        {
            Msg response = new Msg();
            try
            {
                if (po_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PO ID.";
                    return Ok(response);
                }
                DataTable dt = BAL_GRN.i_pi_grn_prefill_from_po(po_id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "PO data fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No approved PO found with this ID.";
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
        //  INSERT / UPDATE GRN  (Header + Items)
        //  Route  : POST /i_pi_grn_insert_update
        //  Flow   :
        //    Step 1 → Upsert GRN header
        //    Step 2 → If edit, hard delete old items
        //    Step 3 → Loop and insert item rows
        // ============================================================
        [HttpPost]
        [Route("i_pi_grn_insert_update")]
        public IActionResult i_pi_grn_insert_update([FromBody] GrnDTO model)
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

                // Step 1 — Upsert header ─────────────────────────────
                DataTable dt = BAL_GRN.i_pi_grn_insert_update(
                    model.grn_id,
                    model.grn_number,
                    model.grn_po_id,
                    model.grn_vendor_id,
                    model.grn_received_date,
                    model.grn_delivery_challan_number ?? "",
                    model.grn_store_location_id,
                    model.grn_remarks ?? "",
                    model.grn_status ?? "Draft",
                    model.grn_created_by_user_id
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                int status_flag = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                string status_msg = Convert.ToString(dt.Rows[0]["status_message"]);
                int new_grn_id = Convert.ToInt32(dt.Rows[0]["grn_id"]);

                if (status_flag == 0)
                {
                    response.Status = 0;
                    response.Message = status_msg;
                    return Ok(response);
                }

                // Step 2 — Hard delete old items if editing ──────────
                if (model.grn_id > 0)
                {
                    BAL_GRN.i_pi_grn_items_delete_by_grn(new_grn_id);
                }

                // Step 3 — Insert item rows ───────────────────────────
                if (model.items != null && model.items.Count > 0)
                {
                    foreach (var item in model.items)
                    {
                        BAL_GRN.i_pi_grn_item_insert(
                            new_grn_id,
                            item.grni_po_item_id,
                            item.grni_item_id,
                            item.grni_ordered_qty,
                            item.grni_received_qty,
                            item.grni_rejected_qty,
                            item.grni_discrepancy_notes ?? "",
                            item.grni_unit_price,
                            item.grni_gst_percent
                        );
                    }
                }

                response.Status = 1;
                response.Message = status_msg;
                response.Result = new { grn_id = new_grn_id };
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
        //  SELECT ALL GRNs / SELECT BY ID
        //  Route  : GET /i_pi_grn_select_all_and_id?grn_id=0
        // ============================================================
        [HttpGet]
        [Route("i_pi_grn_select_all_and_id")]
        public IActionResult i_pi_grn_select_all_and_id([FromQuery] int grn_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_GRN.i_pi_grn_select_all_and_id(grn_id);
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
        //  SELECT GRN ITEMS BY GRN ID
        //  Route  : GET /i_pi_grn_items_select?grn_id=xx
        // ============================================================
        [HttpGet]
        [Route("i_pi_grn_items_select")]
        public IActionResult i_pi_grn_items_select([FromQuery] int grn_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_GRN.i_pi_grn_items_select(grn_id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Items fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No items found.";
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
        //  APPROVAL ACTION
        //  Route  : POST /i_pi_grn_approval_action
        // ============================================================
        [HttpPost]
        [Route("i_pi_grn_approval_action")]
        public IActionResult i_pi_grn_approval_action([FromBody] GrnApprovalDTO model)
        {
            Msg response = new Msg();
            try
            {
                if (model == null || model.grn_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid GRN ID.";
                    return Ok(response);
                }
                if (string.IsNullOrWhiteSpace(model.action))
                {
                    response.Status = 0;
                    response.Message = "Action must be provided (Approved / Rejected / SendBack).";
                    return Ok(response);
                }
                if (model.approved_by_user_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid approver user ID.";
                    return Ok(response);
                }

                DataTable dt = BAL_GRN.i_pi_grn_approval_action(
                    model.grn_id,
                    model.action,
                    model.approved_by_user_id,
                    model.grn_rejection_remarks ?? ""
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
        //  DELETE GRN
        //  Route  : POST /i_pi_grn_delete?id=xx
        // ============================================================
        [HttpPost]
        [Route("i_pi_grn_delete")]
        public IActionResult i_pi_grn_delete([FromQuery] int id)
        {
            Msg response = new Msg();
            try
            {
                if (id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid GRN ID.";
                    return Ok(response);
                }
                DataTable dt = BAL_GRN.i_pi_grn_delete(id);
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
        //  GET APPROVED PO DROPDOWN
        //  Route  : GET /i_pi_get_approved_po_ddl?SearchTerm=
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_approved_po_ddl")]
        public IActionResult i_pi_get_approved_po_ddl([FromQuery] string SearchTerm = "")
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_GRN.i_pi_get_approved_po_ddl(SearchTerm);
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "PO list fetched.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No approved POs found.";
                    response.Result = new object[0];
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
        //  GET STORE LOCATION DROPDOWN
        //  Route  : GET /i_pi_get_store_location_ddl
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_store_location_ddl")]
        public IActionResult i_pi_get_store_location_ddl()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_GRN.i_pi_get_store_location_ddl();
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Store locations fetched.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No store locations found.";
                    response.Result = new object[0];
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
    }
}