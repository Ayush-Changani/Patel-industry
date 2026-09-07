using Backend.Config.Master.BAL;
using Backend.DAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Data;

namespace Backend.Config.Master.Controller
{
    
     
    public class Controller_city_master : ControllerBase
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
        public class CityDTO
        {
            public int cit_id { get; set; }
            public string cit_name { get; set; }
            public int cit_taluka_name { get; set; }
            public int cit_is_active { get; set; }
        }

        #endregion
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }

        #region INSERT CITY
        [HttpPost]
        [Route("i_pi_city_mst_detail_insert")]
        public IActionResult i_pi_city_mst_detail_insert([FromForm] CityDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_City_master.i_pi_city_mst_detail_insert(
                    model.cit_id,
                    model.cit_name,
                    model.cit_taluka_name,
                    model.cit_is_active
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
        [Route("i_pi_get_all_city_ddl")]
        public IActionResult i_pi_get_all_city_ddl([FromQuery] SearchTrmDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_City_master.i_pi_get_all_city_ddl(model.SearchTerm);

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

        #region SELECT DETAIL BY CITY ID

        [HttpGet]
        [Route("i_pi_get_city_full_detail_by_id")]
        public IActionResult i_pi_get_city_full_detail_by_id([FromQuery] int cit_id)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_City_master.i_pi_get_city_full_detail_by_id(cit_id);

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
        [Route("i_pi_city_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int cit_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_City_master.i_pi_city_mst_select_all_and_id(cit_id);
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
        [Route("i_pi_city_mst_delete")]
        public IActionResult DeleteById([FromQuery] int cit_id  )
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_City_master.i_pi_city_mst_delete(cit_id);

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
