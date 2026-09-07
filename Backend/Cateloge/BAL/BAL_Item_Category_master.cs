using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Cateloge.BAL
{
    public class BAL_Item_Category_master
    {
        public static DataTable i_pi_item_category_mst_insert(
          int ic_id,
          int ic_item_type,
          int ic_category_code,
          string ic_item_category,
          int ic_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_item_category_mst_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@ic_id ", ic_id));
            cmd.Parameters.Add(para.IntInputPara("@ic_item_type", ic_item_type));
            cmd.Parameters.Add(para.IntInputPara("@ic_category_code", ic_category_code));
            cmd.Parameters.Add(para.StringInputPara("@ic_item_category", ic_item_category));
            cmd.Parameters.Add(para.IntInputPara("@ic_is_active ", ic_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_get_all_item_category_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_item_category_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt;
        }
        public static DataTable i_pi_item_category_mst_select_all_and_id(int ic_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_item_category_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@ic_id", ic_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_item_category_mst_delete(int ic_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_item_category_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@ic_id", ic_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}

