using Backend.DAL;
using Microsoft.Data.SqlClient;
using System;
using System.Data;

namespace Backend.Entity.BAL
{
    public class BAL_Entity_Group
    {
        public static DataTable i_pi_entity_group_mst_insert(
        int eg_id,
        string eg_group
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_entity_group_mst_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@eg_id", eg_id));
            cmd.Parameters.Add(para.StringInputPara("@eg_group", eg_group));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_get_all_entity_group_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_entity_group_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_entity_group_mst_select_all_and_id(int eg_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_entity_group_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@eg_id", eg_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_entity_group_mst_delete(int eg_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_entity_group_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@eg_id", eg_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
