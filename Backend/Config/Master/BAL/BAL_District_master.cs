using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Config.Master.BAL
{
    public class BAL_District_master
    {
        public static DataTable i_pi_district_mst_detail_insert(
          int dis_id,
          string dis_name,
          string dis_state_name,
          int dis_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter(); 
            cmd.CommandText = "i_pi_district_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@dis_id ", dis_id));
            cmd.Parameters.Add(para.StringInputPara("@dis_name", dis_name));
            cmd.Parameters.Add(para.StringInputPara("@dis_state_name", dis_state_name));
            cmd.Parameters.Add(para.IntInputPara("@dis_is_active ", dis_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt;
        }
        public static DataTable i_pi_get_all_district_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_district_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_district_mst_select_all_and_id(int dis_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_district_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@dis_id", dis_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_district_mst_delete(int dis_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_district_mst_delete ";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@dis_id", dis_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
