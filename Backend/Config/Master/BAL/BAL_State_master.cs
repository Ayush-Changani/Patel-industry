using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Config.Master.BAL
{
    public class BAL_State_master
    {
        public static DataTable i_pi_state_mst_detail_insert(
          int st_id,
          string st_name,
          string st_country_name,
          string st_gst_code,
          int st_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter(); 
            cmd.CommandText = "i_pi_state_mst_detail_insert";   
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@st_id ", st_id));
            cmd.Parameters.Add(para.StringInputPara("@st_name", st_name));
            cmd.Parameters.Add(para.StringInputPara("@st_country_name", st_country_name));
            cmd.Parameters.Add(para.StringInputPara("@st_gst_code", st_gst_code));
            cmd.Parameters.Add(para.IntInputPara("@st_is_active ", st_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
             
            return dt;
        }
        public static DataTable i_pi_get_all_state_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_state_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt;
        }
        public static DataTable i_pi_state_mst_select_all_and_id(int st_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_state_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@st_id", st_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_state_mst_delete(int st_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_state_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@st_id", st_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
