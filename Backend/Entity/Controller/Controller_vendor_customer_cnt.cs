using Backend.Config.Master.BAL;
using Backend.DAL;
using Backend.Entity.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Data;


namespace Backend.Entity.Controller
{
    [ApiController]
    public class Controller_vendor_customer_cnt : ControllerBase
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
        public class VendorDTO
        {
            public int vc_id { get; set; }
            public int vc_group_name { get; set; }
            public string vc_vendor_name { get; set; }
            public string vc_vendor_address { get; set; }
            public string vc_gst_number { get; set; }
            public string vc_contact_parson { get; set; }
            public string vc_contact_number { get; set; }
            public int vc_is_vendor { get; set; }
            public int vc_is_customer { get; set; }
        }
        #endregion
        #region INSERT VENDOR AND CUSTOMER  
        [HttpPost]
        [Route("i_pi_vendor_and_customer_insert")]
        public IActionResult i_pi_vendor_and_customer_insert([FromForm] VendorDTO model)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Vendor_Customer_cnt.i_pi_vendor_and_customer_insert(
                    model.vc_id,
                    model.vc_group_name,
                    model.vc_vendor_name,
                    model.vc_vendor_address,
                    model.vc_gst_number,
                    model.vc_contact_parson,
                    model.vc_contact_number,
                    model.vc_is_vendor,
                    model.vc_is_customer
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
        [Route("i_pi_vendor_and_customer_cnt_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int vc_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Vendor_Customer_cnt.i_pi_vendor_and_customer_cnt_select_all_and_id(vc_id);
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
        [Route("i_pi_vendor_and_customer_cnt_delete")]
        public IActionResult DeleteById([FromQuery] int vc_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Vendor_Customer_cnt.i_pi_vendor_and_customer_cnt_delete(vc_id);

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
