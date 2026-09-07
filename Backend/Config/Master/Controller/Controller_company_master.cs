using Backend.Config.Master.BAL;
using Backend.Menu.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;
using System.IO;

namespace Backend.Config.Master.Controller
{
    [ApiController]
    public class Controller_company_master : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public Controller_company_master(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }

        public class CompanyDTO
        {
            public int? com_id { get; set; }
            public string? com_name { get; set; }
            public string? com_person { get; set; }
            public string? com_address { get; set; }
            public string? com_city { get; set; }
            public string? com_taluka { get; set; }
            public string? com_district { get; set; }
            public string? com_state { get; set; }
            public string? com_country { get; set; }
            public string? com_pincode { get; set; }
            public string? com_contact_number { get; set; }
            public string? com_alternate_number { get; set; }
            public string? com_email { get; set; }
            public string? com_website { get; set; }
            public string? com_gst_no { get; set; }
            public int? com_status { get; set; }
        }
        public class SearchTrmDTO
        {
            public string SearchTerm { get; set; }
        }


        [HttpPost]
        [Route("i_pi_company_detail_insert")]
        public IActionResult Insert([FromForm] CompanyDTO model, IFormFile? com_logo_file)
        {
            Msg response = new Msg();
            // Retrieve existing logo name from form if no new file is uploaded
             string logoFileName = Request.Form["com_upload_logo"].ToString() ?? "";

            try
            {
                if (com_logo_file != null && com_logo_file.Length > 0)
                {
                    // Clean Company Name for filename
                    string safeName = (model.com_name ?? "company").Trim().Replace(" ", "_");
                    string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
                    string extension = Path.GetExtension(com_logo_file.FileName);
                     
                    logoFileName = $"{safeName}_logo_{timestamp}{extension}";

                    string folder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "company_logo");
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string fullPath = Path.Combine(folder, logoFileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        com_logo_file.CopyTo(stream);
                    }
                } 

                DataTable dt = BAL_Company_master.i_pi_company_mst_detail_insert(
                    model.com_id ?? 0,
                    model.com_name,
                    model.com_person,
                    model.com_address,
                    model.com_city,
                    model.com_taluka,
                    model.com_district,
                    model.com_state,
                    model.com_country,
                    model.com_pincode,
                    model.com_contact_number,
                    model.com_alternate_number,
                    model.com_email,
                    model.com_website,
                    model.com_gst_no,
                    logoFileName, // Passed to DB
                    model.com_status ?? 1
                );

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                    response.Message = Convert.ToString(dt.Rows[0]["status_message"]);
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

        [HttpGet]
        [Route("i_pi_company_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int com_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Company_master.i_pi_company_mst_select_all_and_id(com_id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    // Add full URL for frontend preview
                    string baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/uploads/company_logo/";
                    if (!dt.Columns.Contains("full_logo_url")) dt.Columns.Add("full_logo_url", typeof(string));

                    foreach (DataRow row in dt.Rows)
                    {
                        string fileName = row["com_upload_logo"]?.ToString();
                        row["full_logo_url"] = !string.IsNullOrEmpty(fileName) ? baseUrl + fileName : "";
                    }

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
        [Route("i_pi_company_mst_delete")]
        public IActionResult Delete([FromQuery] int com_id)
        {
            Msg response = new Msg();
            try
            {
                // Call the BAL method
                DataTable dt = BAL_Company_master.i_pi_company_mst_delete(com_id);

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

        #region SELECT ALL / SEARCH
        [HttpGet]
        [Route("i_pi_get_all_company_ddl")]
        public IActionResult i_pi_get_all_company_ddl([FromQuery] string? SearchTerm)
        {
            Msg response = new Msg();

            try
            {
                DataTable dt = BAL_Company_master.i_pi_get_all_company_ddl(SearchTerm ?? "");

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
    }
}