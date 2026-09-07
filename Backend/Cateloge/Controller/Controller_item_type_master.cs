using Backend.Cateloge.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;

namespace Backend.Cateloge.Controller
{
    [ApiController]
    public class Controller_item_type_master : ControllerBase
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
            public int it_id { get; set; }
            public string it_name { get; set; } 
            public int it_is_active { get; set; }
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion

        #region INSERT COUNTRY
        [HttpPost]
        [Route("i_pi_item_type_mst_detail_insert")]
        public IActionResult i_pi_item_type_mst_detail_insert([FromForm] CountryDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Item_type_master.i_pi_item_type_mst_detail_insert(
                   model.it_id,
                   model.it_name, 
                   model.it_is_active
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
        [Route("i_pi_get_all_item_type_ddl")]
        public IActionResult i_pi_get_all_item_type_ddl([FromQuery] string? SearchTerm)  
        {
            Msg response = new Msg();

            try
            {
                 DataTable dt = BAL_Item_type_master.i_pi_get_all_item_type_ddl(SearchTerm ?? "");

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
        [Route("i_pi_item_type_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int it_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Item_type_master.i_pi_item_type_mst_select_all_and_id(it_id);
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
        [Route("i_pi_item_type_mst_delete")]
        public IActionResult DeleteById([FromQuery] int it_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Item_type_master.i_pi_item_type_mst_delete(it_id);

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

