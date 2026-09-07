using Backend.Config.Master.BAL;
using Backend.Menu.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;


namespace Backend.Menu.Controller
{
    [ApiController]
    public class Controller_menu : ControllerBase
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
        public class SubMenuDTO
        {
            public int id { get; set; }
            public string md_master_menu_id { get; set; }
            public string md_sub_menu_name { get; set; }
            public string md_page_url_1 { get; set; }
            public string md_page_url_2 { get; set; }
            public string md_icon { get; set; }
            public string md_company_id { get; set; }
            public int md_status { get; set; }
        }
            
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion
         
        #region SELECT ALL / SEARCH
        [HttpGet]
        [Route("i_pi_get_all_master_menu_ddl")]
        public IActionResult i_pi_get_all_master_menu_ddl([FromQuery] string? SearchTerm)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_menu.i_pi_get_all_master_menu_ddl(SearchTerm ?? "");

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

        #region Insert Menu
        [HttpPost]
        [Route("i_pi_menu_detail_insert")]
        public IActionResult i_pi_menu_detail_insert([FromForm] SubMenuDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_menu.i_pi_menu_detail_insert(
                   model.id,
                   model.md_master_menu_id,
                   model.md_sub_menu_name,
                   model.md_page_url_1,
                   model.md_page_url_2,
                   model.md_company_id,
                   model.md_icon,
                   model.md_status

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

        #region Get menu
        [HttpGet]
        [Route("i_pi_menu_detail_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_menu.i_pi_menu_detail_select_all_and_id(id);
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
        [Route("i_pi_menu_detail_delete")]
        public IActionResult Delete([FromQuery] int id)
        {
            Msg response = new Msg();
            try
            {
                // Call the BAL method
                DataTable dt = BAL_menu.i_pi_menu_detail_delete(id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    // Note: SP returns status_flag and status_message
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
    }
}
