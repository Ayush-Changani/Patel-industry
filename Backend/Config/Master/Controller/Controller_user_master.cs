using Backend.Config.Master.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;

namespace Backend.Config.Master.Controller
{
    [ApiController]
    public class Controller_user_master : ControllerBase
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
            public int usr_id { get; set; }
            public int usr_group { get; set; }
            public string usr_name { get; set; }
            public string usr_official_email { get; set; }
            public string usr_personal_email { get; set; }
            public string usr_display_name { get; set; }
            public string usr_mobile_number { get; set; }
            public string usr_password { get; set; }
            public int com_id {get; set;}
            public int dept_id {get; set;}
            public int usr_is_active { get; set; } 

        }
        //public class SearchTrmDTO
        //{
        //    public string SearchTerm { get; set; }
        //}
        #endregion

        #region INSERT USER
        [HttpPost]
        [Route("i_pi_user_detail_insert")]
        public IActionResult i_pi_user_detail_insert([FromForm] CountryDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_User_master.i_pi_user_detail_insert(
                   model.usr_id,
                   model.usr_group,
                   model.usr_name,
                   model.usr_official_email,
                   model.usr_personal_email,
                   model.usr_display_name,
                   model.usr_mobile_number,
                   model.usr_password,
                   model.com_id,
                   model.dept_id,
                   model.usr_is_active
                    
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
        [Route("i_pi_user__mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int usr_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_User_master.i_pi_user__mst_select_all_and_id(usr_id);
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
        [Route("i_pi_user_detail_delete")]
        public IActionResult DeleteById([FromQuery] int usr_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_User_master.i_pi_user_detail_delete(usr_id);

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


