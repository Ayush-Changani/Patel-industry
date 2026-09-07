using Backend.DAL;
using Backend.Entity.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;


namespace Backend.Entity.Controller
{
    [ApiController]
    public class Controller_entity_group : ControllerBase
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
        public class EntityDTO
        {
            public int eg_id { get; set; }
            public string eg_group { get; set; }
        }
        #endregion
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }

        #region INSERT ENTITY GROUP
        [HttpPost]
        [Route("i_pi_entity_group_mst_insert")]
        public IActionResult i_pi_entity_group_mst_insert([FromForm] EntityDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Entity_Group.i_pi_entity_group_mst_insert(
                    model.eg_id,
                    model.eg_group
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
        [Route("i_pi_get_all_entity_group_ddl")]
        public IActionResult i_pi_get_all_entity_group_ddl([FromQuery] SearchTrmDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Entity_Group.i_pi_get_all_entity_group_ddl(model.SearchTerm);

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
        [Route("i_pi_entity_group_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int eg_id)
        { 
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Entity_Group.i_pi_entity_group_mst_select_all_and_id(eg_id);
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
        [Route("i_pi_entity_group_mst_delete")]
        public IActionResult DeleteById([FromQuery] int eg_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Entity_Group.i_pi_entity_group_mst_delete(eg_id);

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
