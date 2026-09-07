using Backend.Config.Master.BAL;
using Backend.HR.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Data;
using System.IO;

namespace Backend.Config.Master.Controller
{
    [ApiController]
    public class Controller_Employee_Master : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public Controller_Employee_Master(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }

        public class EmployeeDTO
        {
            public int? emp_id { get; set; }
            public string? emp_code { get; set; }

            // Personal
            public string? emp_first_name { get; set; }
            public string? emp_last_name { get; set; }
            public string? emp_dob { get; set; }
            public string? emp_gender { get; set; }
            public string? emp_blood_group { get; set; }
            public string? emp_marital_status { get; set; }
            public string? emp_mobile { get; set; }
            public string? emp_alternate_mobile { get; set; }
            public string? emp_personal_email { get; set; }
            public string? emp_aadhar { get; set; }
            public string? emp_pan { get; set; }

            // Address
            public string? emp_address { get; set; }
            public int? emp_city { get; set; }
            public int? emp_taluka { get; set; }
            public int? emp_district { get; set; }
            public int? emp_state { get; set; }
            public int? emp_country { get; set; }
            public string? emp_pincode { get; set; }

            // Job
            public string? emp_doj { get; set; }
            public string? emp_type { get; set; }
            public int? emp_department_id { get; set; }
            public int? emp_designation_id { get; set; }
            public int? emp_reporting_manager_id { get; set; }
            public string? emp_work_location { get; set; }
            public string? emp_shift { get; set; }
            public string? emp_work_email { get; set; }
            public int? emp_probation_months { get; set; }
            public string? emp_confirmation_date { get; set; }
            public decimal? emp_ctc { get; set; }

            // Existing files
            public string? emp_photo_existing { get; set; }
            public string? emp_doc_aadhar_existing { get; set; }
            public string? emp_doc_pan_existing { get; set; }
            public string? emp_doc_offer_existing { get; set; }
            public string? emp_doc_experience_existing { get; set; }
            public string? emp_doc_education_existing { get; set; }
            public string? emp_doc_other_existing { get; set; }
            public string? emp_doc_other_label { get; set; }

            // Bank
            public string? emp_bank_name { get; set; }
            public string? emp_account_number { get; set; }
            public string? emp_ifsc_code { get; set; }
            public string? emp_account_type { get; set; }
            public string? emp_branch_name { get; set; }
            public string? emp_upi_id { get; set; }

            public int? emp_status { get; set; }
        }

        // ── GET NEXT EMPLOYEE CODE ──────────────────────────────────────────
        [HttpGet]
        [Route("i_pi_get_next_designation_code")]
        public IActionResult GetNextDesignationCode()
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Designation_Master.i_pi_get_next_designation_code();

                if (dt != null && dt.Rows.Count > 0)
                {
                    response.Status = Convert.ToInt32(dt.Rows[0]["status_flag"]);
                    response.Result = Convert.ToString(dt.Rows[0]["Result"]);
                }
                else
                {
                    response.Status = 0;
                    response.Message = "Could not generate designation code.";
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
            }

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ================= INSERT / UPDATE =================
        [HttpPost]
        [Route("i_pi_employee_mst_detail_insert")]
        public IActionResult Insert(
            [FromForm] EmployeeDTO model,
            IFormFile? emp_photo_file,
            IFormFile? emp_doc_aadhar_file,
            IFormFile? emp_doc_pan_file,
            IFormFile? emp_doc_offer_file,
            IFormFile? emp_doc_experience_file,
            IFormFile? emp_doc_education_file,
            IFormFile? emp_doc_other_file
        )
        {
            Msg response = new Msg();

            try
            {
                string folder = Path.Combine(
                    _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                    "uploads", "employee"
                );

                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                string safeName = (model.emp_first_name ?? "emp").Trim().Replace(" ", "_").ToLower();
                string mobilePart = (model.emp_mobile ?? "00000").Length >= 5
                    ? model.emp_mobile.Substring(0, 5)
                    : "00000";

                // PHOTO
                string photoFileName = Request.Form["emp_photo_existing"];
                if (emp_photo_file != null && emp_photo_file.Length > 0)
                {
                    string ext = Path.GetExtension(emp_photo_file.FileName);
                    photoFileName = $"{safeName}_photo_{mobilePart}{ext}";
                    SaveFile(emp_photo_file, folder, photoFileName);
                }

                // AADHAR
                string docAadhar = Request.Form["emp_doc_aadhar_existing"];
                if (emp_doc_aadhar_file != null && emp_doc_aadhar_file.Length > 0)
                {
                    string ext = Path.GetExtension(emp_doc_aadhar_file.FileName);
                    docAadhar = $"{safeName}_aadhar_{mobilePart}{ext}";
                    SaveFile(emp_doc_aadhar_file, folder, docAadhar);
                }

                // PAN
                string docPan = Request.Form["emp_doc_pan_existing"];
                if (emp_doc_pan_file != null && emp_doc_pan_file.Length > 0)
                {
                    string ext = Path.GetExtension(emp_doc_pan_file.FileName);
                    docPan = $"{safeName}_pan_{mobilePart}{ext}";
                    SaveFile(emp_doc_pan_file, folder, docPan);
                }

                // OFFER
                string docOffer = Request.Form["emp_doc_offer_existing"];
                if (emp_doc_offer_file != null && emp_doc_offer_file.Length > 0)
                {
                    string ext = Path.GetExtension(emp_doc_offer_file.FileName);
                    docOffer = $"{safeName}_offer_{mobilePart}{ext}";
                    SaveFile(emp_doc_offer_file, folder, docOffer);
                }

                // EXPERIENCE
                string docExperience = Request.Form["emp_doc_experience_existing"];
                if (emp_doc_experience_file != null && emp_doc_experience_file.Length > 0)
                {
                    string ext = Path.GetExtension(emp_doc_experience_file.FileName);
                    docExperience = $"{safeName}_experience_{mobilePart}{ext}";
                    SaveFile(emp_doc_experience_file, folder, docExperience);
                }

                // EDUCATION
                string docEducation = Request.Form["emp_doc_education_existing"];
                if (emp_doc_education_file != null && emp_doc_education_file.Length > 0)
                {
                    string ext = Path.GetExtension(emp_doc_education_file.FileName);
                    docEducation = $"{safeName}_education_{mobilePart}{ext}";
                    SaveFile(emp_doc_education_file, folder, docEducation);
                }

                // OTHER
                string docOther = Request.Form["emp_doc_other_existing"];
                if (emp_doc_other_file != null && emp_doc_other_file.Length > 0)
                {
                    string ext = Path.GetExtension(emp_doc_other_file.FileName);
                    docOther = $"{safeName}_other_{mobilePart}{ext}";
                    SaveFile(emp_doc_other_file, folder, docOther);
                }

                // ================= DB CALL =================
                DataTable dt = BAL_Employee_Master.i_pi_employee_mst_detail_insert(
                    model.emp_id ?? 0,
                    model.emp_code ?? "",
                    model.emp_first_name ?? "",
                    model.emp_last_name ?? "",
                    model.emp_dob ?? "",
                    model.emp_gender ?? "",
                    model.emp_blood_group ?? "",
                    model.emp_marital_status ?? "",
                    model.emp_mobile ?? "",
                    model.emp_alternate_mobile ?? "",
                    model.emp_personal_email ?? "",
                    model.emp_aadhar ?? "",
                    model.emp_pan ?? "",
                    model.emp_address ?? "",
                    model.emp_city ?? 0,
                    model.emp_taluka ?? 0,
                    model.emp_district ?? 0,
                    model.emp_state ?? 0,
                    model.emp_country ?? 0,
                    model.emp_pincode ?? "",
                    photoFileName,
                    model.emp_doj ?? "",
                    model.emp_type ?? "",
                    model.emp_department_id ?? 0,
                    model.emp_designation_id ?? 0,
                    model.emp_reporting_manager_id ?? 0,
                    model.emp_work_location ?? "",
                    model.emp_shift ?? "",
                    model.emp_work_email ?? "",
                    model.emp_probation_months ?? 0,
                    model.emp_confirmation_date ?? "",
                    model.emp_ctc ?? 0,
                    docAadhar,
                    docPan,
                    docOffer,
                    docExperience,
                    docEducation,
                    docOther,
                    model.emp_doc_other_label ?? "",
                    model.emp_bank_name ?? "",
                    model.emp_account_number ?? "",
                    model.emp_ifsc_code ?? "",
                    model.emp_account_type ?? "",
                    model.emp_branch_name ?? "",
                    model.emp_upi_id ?? "",
                    model.emp_status ?? 1
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
                return BadRequest(new Msg
                {
                    Status = 0,
                    Message = ex.Message
                });
            }
        }

        private void SaveFile(IFormFile file, string folder, string fileName)
        {
            string path = Path.Combine(folder, fileName);
            using var stream = new FileStream(path, FileMode.Create);
            file.CopyTo(stream);
        }

        // ── SELECT ALL / BY ID ─────────────────────────────────────────────────
        [HttpGet]
        [Route("i_pi_employee_mst_select_all_and_id")]
        public IActionResult SelectAllAndById([FromQuery] int emp_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Employee_Master.i_pi_employee_mst_select_all_and_id(emp_id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    // Build base URL for file previews
                    string baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/uploads/employee/";
                    string[] docCols = {
                        "emp_photo", "emp_doc_aadhar", "emp_doc_pan",
                        "emp_doc_offer", "emp_doc_experience",
                        "emp_doc_education", "emp_doc_other"
                    };
                    foreach (string col in docCols)
                    {
                        string urlCol = col + "_url";
                        if (!dt.Columns.Contains(urlCol)) dt.Columns.Add(urlCol, typeof(string));
                        foreach (DataRow row in dt.Rows)
                        {
                            string fn = row[col]?.ToString();
                            row[urlCol] = !string.IsNullOrEmpty(fn) ? baseUrl + fn : "";
                        }
                    }

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

                return Content(JsonConvert.SerializeObject(response), "application/json");
            }
            catch (Exception ex)
            {
                return BadRequest(new Msg { Status = 0, Message = ex.Message });
            }
        }

        // ── DELETE ─────────────────────────────────────────────────────────────
        [HttpPost]
        [Route("i_pi_employee_mst_delete")]
        public IActionResult Delete([FromQuery] int emp_id)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Employee_Master.i_pi_employee_mst_delete(emp_id);
                if (dt != null && dt.Rows.Count > 0)
                {
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


        // ── EMPLOYEE DDL ───────────────────────────────────────────────────────
        [HttpGet]
        [Route("i_pi_get_all_employee_ddl")]
        public IActionResult i_pi_get_all_employee_ddl(
            [FromQuery] string? SearchTerm,
            [FromQuery] int exclude_emp_id = 0)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Employee_Master.i_pi_get_all_employee_ddl(
                    SearchTerm ?? "", exclude_emp_id);

                response.Status = dt != null && dt.Rows.Count > 0 ? 1 : 0;
                response.Message = response.Status == 1 ? "Data fetched successfully." : "No records found.";
                response.Result = response.Status == 1 ? dt : null;
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ── DESIGNATION DDL (filtered by dept) ────────────────────────────────
        [HttpGet]
        [Route("i_pi_get_all_designation_ddl_using_dept_id")]
        public IActionResult i_pi_get_all_designation_ddl_using_dept_id(
            [FromQuery] string? SearchTerm,
            [FromQuery] int dept_id = 0)
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Employee_Master.i_pi_get_all_designation_ddl_using_dept_id(
                    SearchTerm ?? "", dept_id);

                response.Status = dt != null && dt.Rows.Count > 0 ? 1 : 0;
                response.Message = response.Status == 1 ? "Data fetched successfully." : "No records found.";
                response.Result = response.Status == 1 ? dt : null;
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

        // ── EMPLOYEE DDL ───────────────────────────────────────────────────────
        [HttpGet]
        [Route("i_pi_get_employee_ddl")]
        public IActionResult i_pi_get_employee_ddl(
            [FromQuery] string? SearchTerm)
           
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_Employee_Master.i_pi_get_employee_ddl(SearchTerm ?? "");

                response.Status = dt != null && dt.Rows.Count > 0 ? 1 : 0;
                response.Message = response.Status == 1 ? "Data fetched successfully." : "No records found.";
                response.Result = response.Status == 1 ? dt : null;
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
            }
            return Content(JsonConvert.SerializeObject(response), "application/json");
        }

    }
}