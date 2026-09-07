using Backend.Cateloge.BAL;
using Backend.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;


namespace Backend.Cateloge.Controller
{
    [ApiController]
    public class Controller_item_category_master : ControllerBase
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
        public class StateDTO
        {
            public int ic_id { get; set; }
            public int ic_item_type { get; set; }
            public int ic_category_code { get; set; }
            public string ic_item_category { get; set; } 
            public int ic_is_active { get; set; }
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion
        #region INSERT COUNTRY
        [HttpPost]
        [Route("i_pi_item_category_mst_insert")]
        public IActionResult i_pi_item_category_mst_insert([FromForm] StateDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Item_Category_master.i_pi_item_category_mst_insert(
                    model.ic_id,
                    model.ic_item_type,
                    model.ic_category_code,
                    model.ic_item_category,
                    model.ic_is_active
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
        [Route("i_pi_get_all_item_category_ddl")]
        public IActionResult i_pi_get_all_item_category_ddl([FromQuery] SearchTrmDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Item_Category_master.i_pi_get_all_item_category_ddl(model.SearchTerm);

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
        [HttpGet]
        [Route("i_pi_item_category_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int ic_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Item_Category_master.i_pi_item_category_mst_select_all_and_id(ic_id);
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
        [Route("i_pi_item_category_mst_delete")]
        public IActionResult DeleteById([FromQuery] int ic_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Item_Category_master.i_pi_item_category_mst_delete(ic_id);

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
