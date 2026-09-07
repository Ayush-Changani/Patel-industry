using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Config.Master.BAL
{
    public class BAL_HSN_Code_master
    {
       
        public static DataTable i_pi_hsn_code_mst_detail_insert(
            int hsn_id,
            DateTime hsn_effective_date,
            int hsn_gst_slab,
            int hsn_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter(); 
            cmd.CommandText = "i_pi_hsn_code_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@hsn_id", hsn_id));
            cmd.Parameters.Add(para.DateInputPara("@hsn_effective_date", hsn_effective_date));
            cmd.Parameters.Add(para.IntInputPara("@hsn_gst_slab", hsn_gst_slab));
            cmd.Parameters.Add(para.IntInputPara("@hsn_is_active", hsn_is_active));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
             return dt;
        }

        
        public static DataTable i_pi_hsn_code_dtl_delete_by_master(int hsn_master_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter(); 
            cmd.CommandText = "i_pi_hsn_code_dtl_delete_by_master";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@hsn_master_id", hsn_master_id)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt; 
        }
         
        public static DataTable i_pi_hsn_code_dtl_list_insert(
            int hsn_master_id,
            int hsn_code
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter(); 
            cmd.CommandText = "i_pi_hsn_code_dtl_list_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@hsn_master_id", hsn_master_id));
            cmd.Parameters.Add(para.IntInputPara("@hsn_code", hsn_code)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt;  
        }
        public static DataTable i_pi_get_all_hsn_code_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_hsn_code_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt;
        }
        public static DataTable i_pi_get_gst_on_hsn_code(int hsn_dtl_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_gst_on_hsn_code";
            cmd.CommandType = CommandType.StoredProcedure; 
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@hsn_dtl_id", hsn_dtl_id)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_hsn_code_mst_select_all_and_id(int hsn_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_hsn_code_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@hsn_id", hsn_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
