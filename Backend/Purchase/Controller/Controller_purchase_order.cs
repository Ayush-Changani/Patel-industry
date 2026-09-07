using Backend.Purchase.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace Backend.Purchase.Controller
{
    [ApiController]
    public class Controller_purchase_order : ControllerBase
    {

        #region RESPONSE MODEL
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }
        #endregion


        #region DTOs

        public class PurchaseOrderDTO
        {
            public int po_id { get; set; }
            public string po_number { get; set; }
            public DateTime po_date { get; set; }
            public int po_pq_id { get; set; }
            public int po_vendor_id { get; set; }
            public int po_entity_id { get; set; }
            public int po_department_id { get; set; }
            public DateTime po_expected_delivery { get; set; }
            public string po_supply_type { get; set; }   // Intra | Inter
            public string po_delivery_address { get; set; }
            public string po_terms_conditions { get; set; }
            public string po_remarks { get; set; }
            public string po_status { get; set; }
            public int po_created_by_user_id { get; set; }

            public List<PurchaseOrderItemDTO> items { get; set; }
        }

        public class PurchaseOrderItemDTO
        {
            public int poi_item_id { get; set; }
            public int poi_pr_item_id { get; set; }
            public decimal poi_qty { get; set; }
            public decimal poi_unit_price { get; set; }
            public decimal poi_discount_percent { get; set; }
            public decimal poi_gst_percent { get; set; }
            public string poi_remarks { get; set; }
        }

        public class PurchaseOrderApprovalDTO
        {
            public int po_id { get; set; }
            public string action { get; set; }
            public int approved_by_user_id { get; set; }
            public string po_rejection_remarks { get; set; }
        }

        #endregion


        // ============================================================
        //  GET NEXT PO NUMBER
        //  Route  : GET /i_pi_get_next_po_number
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_next_po_number")]
        public IActionResult i_pi_get_next_po_number()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Order.i_pi_get_next_po_number();
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "PO number fetched successfully.";
                    response.Result = Convert.ToInt32(dt.Rows[0]["Result"]);
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }


        // ============================================================
        //  PRE-FILL FROM FINALIZED QUOTATION
        //  Route  : GET /i_pi_purchase_order_prefill_from_pq
        //  Returns: Header info + all winning vendor items in flat rows
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_order_prefill_from_pq")]
        public IActionResult i_pi_purchase_order_prefill_from_pq([FromQuery] int pq_id)
        {
            Msg response = new Msg();
            try
            {
                if (pq_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PQ ID.";
                    return Ok(response);
                }

                DataTable dt = BAL_Purchase_Order.i_pi_purchase_order_prefill_from_pq(pq_id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Pre-fill data fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No data found for this quotation.";
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }


        // ============================================================
        //  INSERT / UPDATE PO  (Header + Items)
        //  Route  : POST /i_pi_purchase_order_insert_update
        //  Flow   :
        //    Step 1 → Insert / update PO header
        //    Step 2 → If edit, hard delete old item rows
        //    Step 3 → Loop items, insert one row each
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_order_insert_update")]
        public IActionResult i_pi_purchase_order_insert_update([FromBody] PurchaseOrderDTO model)
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

                // Step 1 — Header ─────────────────────────────────
                DataTable dt = BAL_Purchase_Order.i_pi_purchase_order_insert_update(
                    model.po_id,
                    model.po_number,
                    model.po_date,
                    model.po_pq_id,
                    model.po_vendor_id,
                    model.po_entity_id,
                    model.po_department_id,
                    model.po_expected_delivery,
                    model.po_supply_type ?? "Intra",
                    model.po_delivery_address ?? "",
                    model.po_terms_conditions ?? "",
                    model.po_remarks ?? "",
                    model.po_status ?? "Draft",
                    model.po_created_by_user_id
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                int status_flag = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                string status_message = Convert.ToString(dt.Rows[0]["status_message"]);
                int purchase_order_id = Convert.ToInt32(dt.Rows[0]["purchase_order_id"]);

                if (status_flag == 0)
                {
                    response.Status = 0;
                    response.Message = status_message;
                    return Ok(response);
                }

                // Step 2 — Delete old items on edit ───────────────
                if (model.po_id > 0)
                    BAL_Purchase_Order.i_pi_purchase_order_items_delete_by_master(purchase_order_id);

                // Step 3 — Insert each item row ───────────────────
                if (model.items != null && model.items.Count > 0)
                {
                    foreach (var item in model.items)
                    {
                        BAL_Purchase_Order.i_pi_purchase_order_item_insert(
                            purchase_order_id,
                            item.poi_item_id,
                            item.poi_pr_item_id,
                            item.poi_qty,
                            item.poi_unit_price,
                            item.poi_discount_percent,
                            item.poi_gst_percent,
                            item.poi_remarks ?? ""
                        );
                    }
                }

                response.Status = 1;
                response.Message = status_message;
                response.Result = new { purchase_order_id };
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                return BadRequest(response);
            }
        }


        // ============================================================
        //  SELECT ALL PO HEADERS / SELECT BY ID
        //  Route  : GET /i_pi_purchase_order_select_all_and_id
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_order_select_all_and_id")]
        public IActionResult i_pi_purchase_order_select_all_and_id([FromQuery] int po_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Order.i_pi_purchase_order_select_all_and_id(po_id);
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
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }


        // ============================================================
        //  SELECT PO ITEMS BY PO ID
        //  Route  : GET /i_pi_purchase_order_items_select
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_order_items_select")]
        public IActionResult i_pi_purchase_order_items_select([FromQuery] int po_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Order.i_pi_purchase_order_items_select(po_id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "Items fetched successfully.";
                    response.Result = dt;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No items found for this PO.";
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }


        // ============================================================
        //  APPROVAL ACTION (Approved / Rejected / SendBack)
        //  Route  : POST /i_pi_purchase_order_approval_action
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_order_approval_action")]
        public IActionResult i_pi_purchase_order_approval_action([FromBody] PurchaseOrderApprovalDTO model)
        {
            Msg response = new Msg();
            try
            {
                if (model == null || model.po_id <= 0)
                { response.Status = 0; response.Message = "Invalid PO ID."; return Ok(response); }

                if (string.IsNullOrWhiteSpace(model.action))
                { response.Status = 0; response.Message = "Action is required."; return Ok(response); }

                if (model.approved_by_user_id <= 0)
                { response.Status = 0; response.Message = "Invalid approver user ID."; return Ok(response); }

                DataTable dt = BAL_Purchase_Order.i_pi_purchase_order_approval_action(
                    model.po_id, model.action,
                    model.approved_by_user_id,
                    model.po_rejection_remarks ?? ""
                );

                if (dt == null || dt.Rows.Count == 0)
                { response.Status = 0; response.Message = "No response from database."; return Ok(response); }

                response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = "Internal server error: " + ex.Message;
                return Ok(response);
            }
        }


        // ============================================================
        //  DELETE PO
        //  Route  : POST /i_pi_purchase_order_delete
        //  Blocks delete if status is Approved
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_order_delete")]
        public IActionResult i_pi_purchase_order_delete([FromQuery] int id)
        {
            Msg response = new Msg();
            try
            {
                if (id <= 0)
                { response.Status = 0; response.Message = "Invalid PO ID."; return Ok(response); }

                DataTable dt = BAL_Purchase_Order.i_pi_purchase_order_delete(id);

                if (dt == null || dt.Rows.Count == 0)
                { response.Status = 0; response.Message = "No response from database."; return Ok(response); }

                response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = "Internal server error: " + ex.Message;
                return Ok(response);
            }
        }

        // ============================================================
        //  GET APPROVED PR DDL
        //  Route  : GET /i_pi_get_finalized_pq_ddl
        //  Called : Pq form — Pq dropdown (Add mode)
        //  Returns: Only Approved PRs with entity & department info
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_finalized_pq_ddl")]
        public IActionResult i_pi_get_finalized_pq_ddl([FromQuery] string SearchTerm)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Order.i_pi_get_finalized_pq_ddl(SearchTerm ?? "");
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

    }
}