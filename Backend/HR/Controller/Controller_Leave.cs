using Backend.HR.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;

namespace Backend.HR.Controller
{
    [ApiController]
    public class Controller_Leave : ControllerBase
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
        public class LeaveDTO
        {
            public int lr_employee_id { get; set; }
            public string lr_leave_type { get; set; }
            public string lr_from_date { get; set; }
            public string lr_to_date { get; set; }
            public string lr_reason { get; set; }
        }

        public class LeaveApprovalDTO
        {
            public int lr_id { get; set; }
            public string action { get; set; }
            public int approved_by_user_id { get; set; }
            public string remarks { get; set; }
        }
        #endregion

        // ============================================================
        // APPLY LEAVE
        // ============================================================
        [HttpPost]
        [Route("i_pi_leave_request_insert")]
        public IActionResult ApplyLeave([FromBody] LeaveDTO model)
        {
            Msg res = new Msg();

            try
            {
                if (model == null || model.lr_employee_id <= 0)
                {
                    res.Status = 0;
                    res.Message = "Invalid request.";
                    return Ok(res);
                }

                DateTime from = Convert.ToDateTime(model.lr_from_date);
                DateTime to = Convert.ToDateTime(model.lr_to_date);

                if (from > to)
                {
                    res.Status = 0;
                    res.Message = "From date cannot be greater than To date.";
                    return Ok(res);
                }

                DataTable dt = BAL_Leave.i_pi_leave_request_insert(
                    model.lr_employee_id,
                    model.lr_leave_type,
                    from,
                    to,
                    model.lr_reason
                );

                res.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                res.Message = Convert.ToString(dt.Rows[0]["status_message"]);

                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(new Msg { Status = 0, Message = ex.Message });
            }
        }

        // ============================================================
        // GET LEAVE LIST
        // ============================================================
        [HttpGet]
        [Route("i_pi_leave_request_get")]
        public IActionResult GetLeaves(int lr_employee_id = 0)
        {
            DataTable dt = BAL_Leave.i_pi_leave_request_get(lr_employee_id);

            return Content(JsonConvert.SerializeObject(new Msg
            {
                Status = dt.Rows.Count > 0 ? 1 : 0,
                Message = dt.Rows.Count > 0 ? "Data found" : "No data",
                Result = dt
            }), "application/json");
        }

        // ============================================================
        // LEAVE BALANCE
        // ============================================================
        [HttpGet]
        [Route("i_pi_leave_balance_get")]
        public IActionResult GetBalance(int emp_id)
        {
            DataTable dt = BAL_Leave.i_pi_leave_balance_get(emp_id);

            return Content(JsonConvert.SerializeObject(new Msg
            {
                Status = dt.Rows.Count > 0 ? 1 : 0,
                Message = dt.Rows.Count > 0 ? "Balance found" : "No data",
                Result = dt
            }), "application/json");
        }

        // ============================================================
        // APPROVAL 
        // ============================================================
        [HttpPost]
        [Route("i_pi_leave_approval_action")]
        public IActionResult LeaveApproval([FromBody] LeaveApprovalDTO model)
        {
            Msg res = new Msg();

            try
            {
                if (model == null || model.lr_id <= 0)
                {
                    res.Status = 0;
                    res.Message = "Invalid Leave ID.";
                    return Ok(res);
                }

                if (string.IsNullOrWhiteSpace(model.action))
                {
                    res.Status = 0;
                    res.Message = "Action is required.";
                    return Ok(res);
                }

                DataTable dt = BAL_Leave.i_pi_leave_request_approval_action(
                    model.lr_id,
                    model.action,
                    model.approved_by_user_id,
                    model.remarks
                );

                res.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                res.Message = Convert.ToString(dt.Rows[0]["status_message"]);

                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(new Msg { Status = 0, Message = ex.Message });
            }
        }
    }
}