using Backend.Config.Master.BAL;
using Backend.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;


namespace Backend.Config.Master.Controller
{
    [ApiController]
    public class Controller_taluka_master : ControllerBase
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
        public class TalukaDTO
        {
            public int tal_id { get; set; }
            public string tal_name { get; set; }
            public int tal_district_name { get; set; }
            public int tal_is_active { get; set; }
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion
        #region INSERT COUNTRY
        [HttpPost]
        [Route("i_pi_taluka_mst_detail_insert")]
        public IActionResult i_pi_taluka_mst_detail_insert([FromForm] TalukaDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Taluka_master.i_pi_taluka_mst_detail_insert(
                    model.tal_id,
                    model.tal_name,
                    model.tal_district_name,
                    model.tal_is_active
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
        [Route("i_pi_get_all_taluka_ddl")]
        public IActionResult i_pi_get_all_taluka_ddl([FromQuery] SearchTrmDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Taluka_master.i_pi_get_all_taluka_ddl(model.SearchTerm);

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
        [Route("i_pi_taluka_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int tal_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Taluka_master.i_pi_taluka_mst_select_all_and_id(tal_id);
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
        [Route("i_pi_taluka_mst_delete")]
        public IActionResult DeleteById([FromQuery] int tal_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Taluka_master.i_pi_taluka_mst_delete(tal_id);

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

