using Backend.Config.Master.BAL;
using Backend.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;


namespace Backend.Config.Master.Controller
{
    [ApiController]
    public class Controller_district_master : ControllerBase
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
        public class DistrictDTO
        {
            public int dis_id { get; set; }
            public string dis_name { get; set; }
            public string dis_state_name { get; set; }
            public int dis_is_active { get; set; }
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }
        #endregion
        #region INSERT COUNTRY
        [HttpPost]
        [Route("i_pi_district_mst_detail_insert")]
        public IActionResult i_pi_district_mst_detail_insert([FromForm] DistrictDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_District_master.i_pi_district_mst_detail_insert(
                    model.dis_id,
                    model.dis_name,
                    model.dis_state_name,
                    model.dis_is_active
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
        [Route("i_pi_get_all_district_ddl")]
        public IActionResult i_pi_get_all_district_ddl([FromQuery] SearchTrmDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_District_master.i_pi_get_all_district_ddl(model.SearchTerm);

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
        [Route("i_pi_district_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int dis_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_District_master.i_pi_district_mst_select_all_and_id(dis_id);
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
        [Route("i_pi_district_mst_delete")]
        public IActionResult DeleteById([FromQuery] int dis_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_District_master.i_pi_district_mst_delete(dis_id);

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
