using Microsoft.Data.SqlClient;
using System;
using System.Data;
using Backend.DAL;

namespace Backend.Cateloge.BAL
{
    public class BAL_Item_type_master
    {    

        public static DataTable i_pi_item_type_mst_detail_insert(
            int it_id,
            string it_name, 
            int it_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_item_type_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@it_id", it_id));
            cmd.Parameters.Add(para.StringInputPara("@it_name", it_name)); 
            cmd.Parameters.Add(para.IntInputPara("@it_is_active", it_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;  
        }
         
        public static DataTable i_pi_get_all_item_type_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_item_type_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd); 
            return dt;
        }
        public static DataTable i_pi_item_type_mst_select_all_and_id(int it_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_item_type_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@it_id", it_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_item_type_mst_delete(int it_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_item_type_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@it_id", it_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}

