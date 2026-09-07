using Backend.DAL;
using Microsoft.Data.SqlClient;
using System;
using System.Data;

namespace Backend.HR.BAL
{
    public class BAL_Department
    {
        public static DataTable i_pi_department_mst_insert(
        int dept_id,
        string dept_name,
        int dept_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_department_mst_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@dept_id", dept_id));
            cmd.Parameters.Add(para.StringInputPara("@dept_name", dept_name));
            cmd.Parameters.Add(para.IntInputPara("@dept_is_active", dept_is_active));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_get_all_department_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_department_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_department_mst_select_all_and_id(int dept_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_department_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@dept_id", dept_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_department_mst_delete(int dept_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_department_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@dept_id", dept_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
