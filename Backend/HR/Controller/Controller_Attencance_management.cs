using Backend.HR.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace Backend.HR.Controller
{
    [ApiController]
    public class Controller_Attendance : ControllerBase
    {
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }

        public class AttendanceDTO
        {
            public int emp_id { get; set; }
            public DateTime att_date { get; set; }
            public string status { get; set; }
        }

        // SAVE BULK
        [HttpPost]
        [Route("i_pi_attendance_bulk_insert")]
        public IActionResult Save(List<AttendanceDTO> model)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("att_emp_id", typeof(int));
            dt.Columns.Add("att_date", typeof(DateTime));
            dt.Columns.Add("att_status", typeof(string));

            foreach (var item in model)
            {
                dt.Rows.Add(item.emp_id, item.att_date, item.status);
            }

            DataTable res = BAL_Attendance.Save(dt);

            return Ok(new Msg
            {
                Status = 1,
                Message = "Saved Successfully",
                Result = res
            });
        }

        // GET
        [HttpGet]
        [Route("i_pi_attendance_get")]
        public IActionResult Get(int month, int year, int emp_id = 0)
        {
            DataTable dt = BAL_Attendance.Get(month, year, emp_id);

            return Content(JsonConvert.SerializeObject(new Msg
            {
                Status = dt.Rows.Count > 0 ? 1 : 0,
                Message = dt.Rows.Count > 0 ? "Data found" : "No data",
                Result = dt
            }), "application/json");
        }
    }
}