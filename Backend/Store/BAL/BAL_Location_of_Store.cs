using Backend.DAL;
using Microsoft.Data.SqlClient;
using System;
using System.Data;

namespace Backend.Store.BAL
{
    public class BAL_Location_of_Store
    {
        public static DataTable i_pi_location_of_store_insert(
        int sl_id,
        string sl_location,
        int sl_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_location_of_store_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@sl_id", sl_id));
            cmd.Parameters.Add(para.StringInputPara("@sl_location", sl_location));
            cmd.Parameters.Add(para.IntInputPara("@sl_is_active", sl_is_active));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_location_of_store_select_all_and_id(int sl_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_location_of_store_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@sl_id", sl_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_location_of_store_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_location_of_store_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_location_of_store_delete(int sl_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_location_of_store_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@sl_id", sl_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
