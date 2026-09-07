using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Config.Master.BAL
{
    public class BAL_Taluka_master
    {
        public static DataTable i_pi_taluka_mst_detail_insert(
          int tal_id,
          string tal_name,
          int tal_district_name,
          int tal_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_taluka_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure;    
            cmd.Parameters.Add(para.IntInputPara("@tal_id", tal_id));
            cmd.Parameters.Add(para.StringInputPara("@tal_name", tal_name));
            cmd.Parameters.Add(para.IntInputPara("@tal_district_name", tal_district_name ));
            cmd.Parameters.Add(para.IntInputPara("@tal_is_active ", tal_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_get_all_taluka_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_taluka_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_taluka_mst_select_all_and_id(int tal_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_taluka_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@tal_id", tal_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_taluka_mst_delete(int tal_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_taluka_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@tal_id", tal_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}

