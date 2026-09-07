using Backend.Entity.BAL;
using Backend.HR.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Data;

namespace Backend.HR.Controller
{
    [ApiController]
    public class Controller_Entity_master : ControllerBase
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
            public int ent_id { get; set; }
            public int ent_eg_id { get; set; }
            public string ent_name { get; set; }
            public string ent_code { get; set; }
            public int ent_is_active { get; set; }
        }
        #endregion

        #region INSERT / UPDATE
        [HttpPost]
        [Route("i_pi_entity_mst_insert")]
        public IActionResult i_pi_entity_mst_insert([FromForm] EntityDTO model)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Entity_master.i_pi_entity_mst_insert(
                    model.ent_id,
                    model.ent_eg_id,
                    model.ent_name,
                    model.ent_code,
                    model.ent_is_active
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

        #region SELECT ALL AND BY ID
        [HttpGet]
        [Route("i_pi_entity_mst_select_all_and_id")]
        public IActionResult i_pi_entity_mst_select_all_and_id([FromQuery] int ent_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Entity_master.i_pi_entity_mst_select_all_and_id(ent_id);
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

        #region DELETE
        [HttpPost]
        [Route("i_pi_entity_mst_delete")]
        public IActionResult i_pi_entity_mst_delete([FromQuery] int ent_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Entity_master.i_pi_entity_mst_delete(ent_id);

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
        #endregion

        #region DDL
        [HttpGet]
        [Route("i_pi_get_entity_ddl")]
        public IActionResult i_pi_get_entity_ddl([FromQuery] string SearchTerm)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Entity_master.i_pi_get_entity_ddl(SearchTerm);
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