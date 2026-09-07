using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Config.Master.BAL
{
    public class BAL_GST_Slab_master
    {
        public static DataTable i_pi_gst_slab_detail_insert(
          int slab_id,
          string slab_name, 
          int slab_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_gst_slab_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@slab_id", slab_id));
            cmd.Parameters.Add(para.StringInputPara("@slab_name", slab_name)); 
            cmd.Parameters.Add(para.IntInputPara("@slab_is_active ", slab_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_get_all_gst_slab_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_gst_slab_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_gst_slab_mst_select_all_and_id(int slab_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_gst_slab_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@slab_id", slab_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_gst_slab_mst_delete(int slab_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_gst_slab_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@slab_id", slab_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}


