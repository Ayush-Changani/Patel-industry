using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.HR.BAL
{
    public class BAL_Attendance
    {
        public static DataTable Save(DataTable dt)
        {
            SqlCommand cmd = new SqlCommand();

            cmd.CommandText = "i_pi_attendance_bulk_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            SqlParameter param = cmd.Parameters.AddWithValue("@Attendance", dt);
            param.SqlDbType = SqlDbType.Structured;
            param.TypeName = "AttendanceType";

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable Get(int month, int year, int empId)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_attendance_get";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.IntInputPara("@month", month));
            cmd.Parameters.Add(p.IntInputPara("@year", year));
            cmd.Parameters.Add(p.IntInputPara("@emp_id", empId));

            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}