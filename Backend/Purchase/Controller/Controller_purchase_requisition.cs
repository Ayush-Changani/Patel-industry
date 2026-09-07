using Backend.Purchase.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace Backend.Purchase.Controller
{
    [ApiController]
    public class Controller_purchase_requisition : ControllerBase
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

        // ── PR Header DTO ──
        public class PurchaseRequisitionDTO
        {
            public int pr_id { get; set; }
            public string pr_number { get; set; }
            public DateTime pr_required_by_date { get; set; }
            public int pr_entity_id { get; set; }
            public int pr_entity_group_id { get; set; }
            public int pr_department_id { get; set; }
            public int pr_store_location_id { get; set; }
            public int pr_requested_by_user_id { get; set; }
            public int pr_priority { get; set; }
            public string pr_purpose_justification { get; set; }
            public string pr_remarks { get; set; }
            public string pr_status { get; set; }

            // Item rows — sent one by one from repeater grid
            public List<PurchaseRequisitionItemDTO> items { get; set; }
        }

        // ── PR Item DTO ──
        public class PurchaseRequisitionItemDTO
        {
            public int pri_item_id { get; set; }
            public decimal pri_quantity { get; set; }
            public string pri_item_remarks { get; set; }
        }

        // ── Approval DTO ──
        public class PurchaseRequisitionApprovalDTO
        {
            public int pr_id { get; set; }
            public string action { get; set; }
            public int approved_by_user_id { get; set; }
            public string pr_rejection_remarks { get; set; }
        }

        #endregion


        // ============================================================
        //  GET NEXT PR NUMBER
        //  Route  : GET /i_pi_get_next_pr_number
        //  Called : When PR form loads in Add mode
        //  Returns: Next sequence number as integer
        // ============================================================
        [HttpGet]
        [Route("i_pi_get_next_pr_number")]
        public IActionResult i_pi_get_next_pr_number()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Requisition.i_pi_get_next_pr_number();

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "PR number fetched successfully.";
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
        //  INSERT / UPDATE PR  (Header + Items)
        //  Route  : POST /i_pi_purchase_requisition_insert_update
        //  Called : On Save Draft or Submit from PR form
        //  Flow   :
        //    Step 1 → Insert or update PR header
        //    Step 2 → If edit, delete old item rows first
        //    Step 3 → Loop items list, insert one row per item
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_requisition_insert_update")]
        public IActionResult i_pi_purchase_requisition_insert_update(
            [FromBody] PurchaseRequisitionDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                // Step 1 — Insert or update header ───────────────────
                DataTable dt = BAL_Purchase_Requisition.i_pi_purchase_requisition_insert_update(
                    model.pr_id,
                    model.pr_number,
                    model.pr_required_by_date,
                    model.pr_entity_id,
                    model.pr_entity_group_id,
                    model.pr_department_id,
                    model.pr_store_location_id,
                    model.pr_requested_by_user_id,
                    model.pr_priority,
                    model.pr_purpose_justification,
                    model.pr_remarks,
                    model.pr_status
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                int status_flag = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                string status_message = Convert.ToString(dt.Rows[0]["status_message"]);
                int purchase_requisition_id = Convert.ToInt32(dt.Rows[0]["purchase_requisition_id"]);

                if (status_flag == 0)
                {
                    response.Status = 0;
                    response.Message = status_message;
                    return Ok(response);
                }

                // Step 2 — If edit, hard delete old item rows first ──
                if (model.pr_id > 0)
                {
                    BAL_Purchase_Requisition.i_pi_purchase_requisition_item_delete_by_master(
                        purchase_requisition_id
                    );
                }

                // Step 3 — Insert each item row from repeater grid ───
                if (model.items != null && model.items.Count > 0)
                {
                    foreach (PurchaseRequisitionItemDTO item in model.items)
                    {
                        BAL_Purchase_Requisition.i_pi_purchase_requisition_item_insert(
                            purchase_requisition_id,
                            item.pri_item_id,
                            item.pri_quantity,
                            item.pri_item_remarks
                        );
                    }
                }

                response.Status = 1;
                response.Message = status_message;
                response.Result = new { purchase_requisition_id };

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
        //  SELECT ALL PR HEADERS  /  SELECT BY ID
        //  Route  : GET /i_pi_purchase_requisition_select_all_and_id
        //  Called : List page (pr_id = 0) or form load (pr_id > 0)
        //  Returns: PR header rows with all joined display names
        // ============================================================
        [HttpGet]
        [Route("i_pi_purchase_requisition_select_all_and_id")]
        public IActionResult i_pi_purchase_requisition_select_all_and_id(
            [FromQuery] int pr_id
        )
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Purchase_Requisition.i_pi_purchase_requisition_select_all_and_id(
                    pr_id
                );

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
        //  APPROVAL ACTION  (Approve / Reject)
        //  Route  : POST /i_pi_purchase_requisition_approval_action
        //  Called : When Production Manager clicks
        //           Approve or Reject on the PR list page
        //  Returns: Status 1 = Success | Status 0 = Failure
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_requisition_approval_action")]
        public IActionResult i_pi_purchase_requisition_approval_action(
            [FromBody] PurchaseRequisitionApprovalDTO model
        )
        {
            Msg response = new Msg();
            try
            {
                if (model == null || model.pr_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PR ID.";
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

                DataTable dt = BAL_Purchase_Requisition.i_pi_purchase_requisition_approval_action(
                    model.pr_id,
                    model.action,
                    model.approved_by_user_id,
                    model.pr_rejection_remarks ?? ""
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
        //  DELETE PR
        //  Route  : POST /i_pi_purchase_requisition_delete
        //  Called : From list page delete button
        //  Header → soft delete  |  Items → hard delete
        //  Blocks delete if status is Approved or Pending
        // ============================================================
        [HttpPost]
        [Route("i_pi_purchase_requisition_delete")]
        public IActionResult i_pi_purchase_requisition_delete([FromQuery] int pr_id)
        {
            Msg response = new Msg();
            try
            {
                if (pr_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid PR ID.";
                    return Ok(response);
                }

                DataTable dt = BAL_Purchase_Requisition.i_pi_purchase_requisition_delete(pr_id);

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