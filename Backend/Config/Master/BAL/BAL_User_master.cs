using Microsoft.Data.SqlClient;
using System;
using System.Data;
using Backend.DAL;

namespace Backend.Config.Master.BAL
{
    public class BAL_User_master
    {
         
        public static DataTable i_pi_user_detail_insert(
            int usr_id,
            int usr_group,
            string usr_name,
            string usr_official_email,
            string usr_personal_email,
            string usr_display_name,
            string usr_mobile_number,
            string usr_password,
            int com_id,
            int dept_id,
            int usr_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_user_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@usr_id", usr_id));
            cmd.Parameters.Add(para.IntInputPara("@usr_group", usr_group));
            cmd.Parameters.Add(para.StringInputPara("@usr_name", usr_name));
            cmd.Parameters.Add(para.StringInputPara("@usr_official_email", usr_official_email));
            cmd.Parameters.Add(para.StringInputPara("@usr_personal_email", usr_personal_email));
            cmd.Parameters.Add(para.StringInputPara("@usr_display_name", usr_display_name));
            cmd.Parameters.Add(para.StringInputPara("@usr_mobile_number", usr_mobile_number));
            cmd.Parameters.Add(para.StringInputPara("@usr_password", usr_password));
            cmd.Parameters.Add(para.IntInputPara("@com_id ", com_id)); 
            cmd.Parameters.Add(para.IntInputPara("@dept_id ", dept_id)); 
            cmd.Parameters.Add(para.IntInputPara("@usr_is_active", usr_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt;  
        }
        public static DataTable i_pi_user__mst_select_all_and_id(int usr_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_user__mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@usr_id", usr_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_user_detail_delete(int usr_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_user_detail_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@usr_id", usr_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}


