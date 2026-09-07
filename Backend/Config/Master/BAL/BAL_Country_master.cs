using Microsoft.Data.SqlClient;
using System;
using System.Data;
using Backend.DAL;

namespace Backend.Config.Master.BAL
{
    public class BAL_Country_master
    {
         
        public static DataTable i_pi_country_mst_detail_insert(
            int cu_id,
            string cu_name,
            string cu_country_code,
            int cu_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_country_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@cu_id", cu_id));
            cmd.Parameters.Add(para.StringInputPara("@cu_name", cu_name));
            cmd.Parameters.Add(para.StringInputPara("@cu_country_code", cu_country_code));
            cmd.Parameters.Add(para.IntInputPara("@cu_is_active", cu_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt; 
        }

       
        public static DataTable i_pi_get_all_country_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_country_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_country_mst_select_all_and_id(int cu_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_country_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@cu_id", cu_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_country_mst_delete(int cu_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_country_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@cu_id", cu_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
