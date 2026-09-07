using Backend.Cateloge.BAL;
using Backend.DAL;
using Backend.HR.BAL;
using Backend.Store.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;

namespace Backend.Store.Controller
{
    [ApiController]
    public class Controller_location_of_Store : ControllerBase
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
        public class StoreDTO
        {
            public int sl_id { get; set; }
            public string sl_location { get; set; }
            public int sl_is_active { get; set; }
        }
        #endregion

        #region INSERT ENTITY GROUP
        [HttpPost]
        [Route("i_pi_location_of_store_insert")]
        public IActionResult i_pi_location_of_store_insert([FromForm] StoreDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Location_of_Store.i_pi_location_of_store_insert(
                    model.sl_id,
                    model.sl_location,
                    model.sl_is_active
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
        [HttpGet]
        [Route("i_pi_location_of_store_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int sl_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Location_of_Store.i_pi_location_of_store_select_all_and_id(sl_id);
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
        #region DDL
        [HttpGet]
        [Route("i_pi_location_of_store_ddl")]
        public IActionResult i_pi_location_of_store_ddl([FromQuery] string SearchTerm)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Location_of_Store.i_pi_location_of_store_ddl(SearchTerm);
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
        #endregion

        [HttpPost]
        [Route("i_pi_location_of_store_delete")]
        public IActionResult DeleteById([FromQuery] int sl_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Location_of_Store.i_pi_location_of_store_delete(sl_id);

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
