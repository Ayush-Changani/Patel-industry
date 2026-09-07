using Backend.Dashboard.BAL;
using Backend.HR.BAL;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Data;

namespace Backend.Dashboard.Controller
{
    public class Controller_Dashboard : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public Controller_Dashboard(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }


        [HttpGet]
        [Route("i_pi_get_dashboard_card_chart_count")]
        public IActionResult GetDashboarddetail()
        {
            Msg response = new Msg();

            try
            {
                DataSet ds = BAL_Dashboard.i_pi_get_dashboard_card_chart_count();

                if (ds != null && ds.Tables.Count > 0)
                {
                    var result = new
                    {
                        PRStatus = ds.Tables[0],        // Chart 1
                        GRNStatus = ds.Tables[1],       // Chart 2
                        DashboardCards = ds.Tables[2],  // Cards
                        LatestPR = ds.Tables[3],        // Table 1
                        LatestInvoice = ds.Tables[4]    // Table 2
                    };

                    response.Status = 1;
                    response.Result = result;
                }
                else
                {
                    response.Status = 0;
                    response.Message = "No data found";
                }
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
            }

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }
    }
}
