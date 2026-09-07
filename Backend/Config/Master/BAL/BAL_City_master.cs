using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Config.Master.BAL
{
    public class BAL_City_master
    {
        public static DataTable i_pi_city_mst_detail_insert(
          int cit_id,
          string cit_name,
          int cit_taluka_name,
          int cit_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_city_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure;      
            cmd.Parameters.Add(para.IntInputPara("@cit_id", cit_id));
            cmd.Parameters.Add(para.StringInputPara("@cit_name", cit_name));
            cmd.Parameters.Add(para.IntInputPara("@cit_taluka_name", cit_taluka_name));
            cmd.Parameters.Add(para.IntInputPara("@cit_is_active", cit_is_active));

            
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_get_all_city_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_city_ddl";
            cmd.CommandType = CommandType.StoredProcedure; 
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_get_city_full_detail_by_id(int cit_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_city_full_detail_by_id";
            cmd.CommandType = CommandType.StoredProcedure; 
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@cit_id", cit_id)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_city_mst_select_all_and_id(int cit_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_city_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@cit_id", cit_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_city_mst_delete(int cit_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_city_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@cit_id", cit_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
