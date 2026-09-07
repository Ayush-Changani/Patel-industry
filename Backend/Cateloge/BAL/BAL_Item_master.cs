using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Cateloge.BAL
{
    public class BAL_Item_master
    {
        public static DataTable i_pi_item_master_mst_insert(
          int itm_id,
          int itm_item_category,
          string itm_item_name,
          string itm_item_code,
          int itm_uom,
          int itm_appli_text,
          int itm_hsn_code,
          string itm_gst,
          string itm_maximum_stok,
          string itm_re_order_level,
          int itm_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();


            cmd.CommandText = "i_pi_item_master_mst_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@itm_id ", itm_id));
            cmd.Parameters.Add(para.IntInputPara("@itm_item_category", itm_item_category));
            cmd.Parameters.Add(para.StringInputPara("@itm_item_name", itm_item_name));
            cmd.Parameters.Add(para.StringInputPara("@itm_item_code", itm_item_code));
            cmd.Parameters.Add(para.IntInputPara("@itm_uom", itm_uom));
            cmd.Parameters.Add(para.IntInputPara("@itm_appli_text", itm_appli_text));
            cmd.Parameters.Add(para.IntInputPara("@itm_hsn_code", itm_hsn_code));
            cmd.Parameters.Add(para.StringInputPara("@itm_gst", itm_gst));
            cmd.Parameters.Add(para.StringInputPara("@itm_re_order_level", itm_re_order_level));
            cmd.Parameters.Add(para.StringInputPara("@itm_maximum_stok", itm_maximum_stok));
            cmd.Parameters.Add(para.IntInputPara("@itm_is_active ", itm_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_item_master_mst_select_all_and_id(int itm_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_item_master_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@itm_id", itm_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_item_master_mst_delete(int itm_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_item_master_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@itm_id", itm_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_all_item_master_mst_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_all_item_master_mst_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}


