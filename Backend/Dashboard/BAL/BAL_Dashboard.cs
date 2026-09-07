using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Dashboard.BAL
{
    public class BAL_Dashboard
    {
        public static DataSet i_pi_get_dashboard_card_chart_count()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_dashboard_card_chart_count";
            cmd.CommandType = CommandType.StoredProcedure;

            DataSet ds = CreateCommand.ExecuteDataset(cmd);
            return ds;
        }
    }
}
