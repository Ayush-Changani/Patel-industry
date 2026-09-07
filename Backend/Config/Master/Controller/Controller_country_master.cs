using Backend.Config.Master.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;

namespace Backend.Config.Master.Controller
{
    [ApiController]
    public class Controller_country_master : ControllerBase
    {
        #region COMMON RESPONSE MODEL
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }
        #endregion

        #region DTO
        public class CountryDTO
        {
            public int cu_id { get; set; }
            public string cu_name { get; set; }
            public string cu_country_code { get; set; }
            public int cu_is_active { get; set; }
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion

        #region INSERT COUNTRY
        [HttpPost]
        [Route("i_pi_country_mst_detail_insert")]
        public IActionResult i_pi_country_mst_detail_insert([FromForm] CountryDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Country_master.i_pi_country_mst_detail_insert(
                   model.cu_id,
                   model.cu_name,
                   model.cu_country_code,
                   model.cu_is_active
               );

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                    response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
                    response.Result = null;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No response from database.";
                    response.Result = null;
                }

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
        #endregion

        #region SELECT ALL / SEARCH
        [HttpGet]
        [Route("i_pi_get_all_country_ddl")]
        public IActionResult i_pi_get_all_country_ddl([FromQuery] string? SearchTerm)  
        {
            Msg response = new Msg();

            try
            { 
                DataTable dt = BAL_Country_master.i_pi_get_all_country_ddl(SearchTerm ?? "");

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
        #endregion

        [HttpGet]
        [Route("i_pi_country_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int cu_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Country_master.i_pi_country_mst_select_all_and_id(cu_id);
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
        [HttpPost]
        [Route("i_pi_country_mst_delete")]
        public IActionResult DeleteById([FromQuery] int cu_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Country_master.i_pi_country_mst_delete(cu_id);

                if (dt != null && dt.Rows.Count > 0)
                {
                     
                    response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                    response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
                    response.Result = null;
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
                return BadRequest(new Msg { Status = 0, Message = ex.Message });
            }
        }
    }
}
