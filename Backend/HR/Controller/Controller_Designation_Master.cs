using Backend.Config.Master.BAL;
using Backend.HR.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;

namespace Backend.HR.Controller
{
    [ApiController]
    public class Controller_Designation_Master : ControllerBase
    {
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }

        public class DesignationDTO
        {
            public int? des_id { get; set; }
            public string? des_name { get; set; }
            public string? des_code { get; set; }
            public int? des_department_id { get; set; }
            public string? des_level { get; set; }
            public int? des_reports_to { get; set; }
            public string? des_currency { get; set; }
            public decimal? des_min_ctc { get; set; }
            public decimal? des_max_ctc { get; set; }
            public int? des_status { get; set; }
        }


        // ── GET NEXT DESIGNATION CODE ──────────────────────────────────────────
        [HttpGet]
        [Route("i_pi_get_next_employee_code")]
        public IActionResult GetNextEmployeeCode()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Employee_Master.i_pi_get_next_employee_code();

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                    response.Result = Convert.ToString(dt.Rows[0]["Result"]);
                }
                else
                {
                    response.Status = 0;
                    response.Message = "Could not generate designation code.";
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
            }

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }


        // ── INSERT / UPDATE ────────────────────────────────────────────────────
        [HttpPost]
        [Route("i_pi_designation_mst_detail_insert")]
        public IActionResult Insert([FromBody] DesignationDTO model)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Designation_Master.i_pi_designation_mst_detail_insert(
                    model.des_id ?? 0,
                    model.des_name ?? "",
                    model.des_code ?? "",
                    model.des_department_id ?? 0,
                    model.des_level ?? "",
                    model.des_reports_to ?? 0,
                    model.des_currency ?? "INR",
                    model.des_min_ctc ?? 0,
                    model.des_max_ctc ?? 0,
                    model.des_status ?? 1
                );

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                    response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                return BadRequest(response);
            }
        }


        // ── SELECT ALL / BY ID ─────────────────────────────────────────────────
        [HttpGet]
        [Route("i_pi_designation_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int des_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Designation_Master.i_pi_designation_mst_select_all_and_id(des_id);

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

                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                return BadRequest(new Msg { Status = 0, Message = ex.Message });
            }
        }


        // ── DELETE ─────────────────────────────────────────────────────────────
        [HttpPost]
        [Route("i_pi_designation_mst_delete")]
        public IActionResult Delete([FromQuery] int des_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Designation_Master.i_pi_designation_mst_delete(des_id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                    response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                return BadRequest(response);
            }
        }


        // ── DDL (DROPDOWN LIST) ────────────────────────────────────────────────
        [HttpGet]
        [Route("i_pi_get_all_designation_ddl")]
        public IActionResult i_pi_get_all_designation_ddl([FromQuery] string? SearchTerm)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Designation_Master.i_pi_get_all_designation_ddl(SearchTerm ?? "");

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
    }
}