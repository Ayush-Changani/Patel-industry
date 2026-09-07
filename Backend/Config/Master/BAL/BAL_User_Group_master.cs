using Microsoft.Data.SqlClient;
using System;
using System.Data;
using Backend.DAL;

namespace Backend.Config.Master.BAL
{
    public class BAL_User_Group_master
    {
        
        public static DataTable i_pi_user_group_mst_detail_insert(
            int ug_id,
            string ug_name,
            int ug_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_user_group_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@ug_id", ug_id));
            cmd.Parameters.Add(para.StringInputPara("@ug_name", ug_name));
            cmd.Parameters.Add(para.IntInputPara("@ug_is_active", ug_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;  
        }

        
        public static DataTable i_pi_get_all_user_group_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_user_group_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_user_group_mst_select_all_and_id(int ug_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_user_group_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@ug_id", ug_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_user_group_mst_delete(int ug_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_user_group_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@ug_id", ug_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}

