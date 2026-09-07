using Backend.DAL;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Backend.Entity.BAL
{
    public class BAL_Entity_master
    {
        public static DataTable i_pi_entity_mst_insert(
            int ent_id,
            int ent_eg_id,
            string ent_name,
            string ent_code,
            int ent_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_entity_mst_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@ent_id", ent_id));
            cmd.Parameters.Add(para.IntInputPara("@ent_eg_id", ent_eg_id));
            cmd.Parameters.Add(para.StringInputPara("@ent_name", ent_name));
            cmd.Parameters.Add(para.StringInputPara("@ent_code", ent_code));
            cmd.Parameters.Add(para.IntInputPara("@ent_is_active", ent_is_active));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_entity_mst_select_all_and_id(int ent_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_entity_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@ent_id", ent_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_entity_mst_delete(int ent_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_entity_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@ent_id", ent_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_get_entity_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_get_entity_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}