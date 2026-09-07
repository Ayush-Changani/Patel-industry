using Backend.Cateloge.BAL;
using Backend.DAL;
using Backend.HR.BAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;


namespace Backend.Cateloge.Controller
{
    [ApiController]
    public class Controller_item_master : ControllerBase
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
            public int itm_id { get; set; }
            public int itm_item_category { get; set; }
            public string itm_item_name { get; set; }
            public string itm_item_code { get; set; }
            public int itm_uom { get; set; }
            public int itm_appli_text { get; set; }
            public int itm_hsn_code { get; set; }
            public string itm_gst { get; set; }
            public string itm_maximum_stok { get; set; }
            public string itm_re_order_level { get; set; }
            public int itm_is_active { get; set; }
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion
        #region INSERT COUNTRY
        [HttpPost]
        [Route("i_pi_item_master_mst_insert")]
        public IActionResult i_pi_item_master_mst_insert([FromForm] StateDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Item_master.i_pi_item_master_mst_insert(
                    model.itm_id,
                    model.itm_item_category,
                    model.itm_item_name,
                    model.itm_item_code,
                    model.itm_uom,
                    model.itm_appli_text,
                    model.itm_hsn_code,
                    model.itm_gst,
                    model.itm_re_order_level,
                    model.itm_maximum_stok,
                    model.itm_is_active
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
        [Route("i_pi_item_master_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int itm_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Item_master.i_pi_item_master_mst_select_all_and_id(itm_id);
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
        [Route("i_pi_item_master_mst_delete")]
        public IActionResult DeleteById([FromQuery] int itm_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Item_master.i_pi_item_master_mst_delete(itm_id);

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

        #region DDL
        [HttpGet]
        [Route("i_pi_all_item_master_mst_ddl")]
        public IActionResult i_pi_all_item_master_mst_ddl([FromQuery] string SearchTerm)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Item_master.i_pi_all_item_master_mst_ddl(SearchTerm);
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
    }
}

