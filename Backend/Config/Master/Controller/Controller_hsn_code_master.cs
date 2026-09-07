using Backend.Config.Master.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace Backend.Config.Master.Controller
{
    [ApiController]
    public class Controller_hsn_code_master : ControllerBase
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
        public class HSNMasterDTO
        {
            public int hsn_id { get; set; }
            public DateTime hsn_effective_date { get; set; }
            public int hsn_gst_slab { get; set; }
            public int hsn_is_active { get; set; }
            public List<int> hsn_codes { get; set; }   
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion
 
        [HttpPost]
        [Route("i_pi_hsn_code_mst_detail_insert")]
        public IActionResult i_pi_hsn_code_mst_detail_insert([FromForm] HSNMasterDTO model)
        {
            Msg response = new Msg();

            try
            {
                
                 DataTable dt = BAL_HSN_Code_master.i_pi_hsn_code_mst_detail_insert(
                    model.hsn_id,
                    model.hsn_effective_date,
                    model.hsn_gst_slab,
                    model.hsn_is_active
                );

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    return Ok(response);
                }

                int status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                string message = Convert.ToString(dt.Rows[0]["status_message"]);
                int hsn_master_id = Convert.ToInt32(dt.Rows[0]["hsn_master_id"]);

                if (status == 0)
                {
                    response.Status = 0;
                    response.Message = message;
                    return Ok(response);
                }

                
                if (model.hsn_id > 0)
                {
                    BAL_HSN_Code_master.i_pi_hsn_code_dtl_delete_by_master(hsn_master_id);
                }

              
                if (model.hsn_codes != null && model.hsn_codes.Count > 0)
                {
                    foreach (int code in model.hsn_codes)
                    {
                        BAL_HSN_Code_master.i_pi_hsn_code_dtl_list_insert(
                            hsn_master_id,
                            code
                        );
                    }
                }

                response.Status = 1;
                response.Message = message;
                response.Result = new { hsn_master_id };

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
        #region SELECT ALL / SEARCH
        [HttpGet]
        [Route("i_pi_get_all_hsn_code_ddl")]
        public IActionResult i_pi_get_all_hsn_code_ddl([FromQuery] SearchTrmDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_HSN_Code_master.i_pi_get_all_hsn_code_ddl(model.SearchTerm);

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Message = "data fetched successfully.";
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
                response.Message = $"  Error: {ex.Message}";
            }

            return Content(JsonConvert.SerializeObject(response), "application/json");

        }
        #endregion

        #region SELECT DETAIL BY HSN ID

        [HttpGet]
        [Route("i_pi_get_gst_on_hsn_code")]
        public IActionResult i_pi_get_gst_on_hsn_code([FromQuery] int hsn_dtl_id)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_HSN_Code_master.i_pi_get_gst_on_hsn_code(hsn_dtl_id);

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
                response.Message = $"Error: {ex.Message}";
                response.Result = null;
            }

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }
        #endregion 
        [HttpGet]
        [Route("i_pi_hsn_code_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int hsn_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_HSN_Code_master.i_pi_hsn_code_mst_select_all_and_id(hsn_id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = 1;
                    response.Result = dt;
                }
                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                return BadRequest(new Msg { Status = 0, Message = ex.Message });
            }
        }
    }
}
