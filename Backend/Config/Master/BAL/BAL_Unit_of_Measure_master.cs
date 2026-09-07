using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Config.Master.BAL
{
    public class BAL_Unit_of_Measure_master
    {
        public static DataTable i_pi_unit_of_measure_mst_detail_insert(
          int uom_id,
          string uom_name,
          string uom_discription,
          int uom_is_active
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_unit_of_measure_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure; 
            cmd.Parameters.Add(para.IntInputPara("@uom_id", uom_id));
            cmd.Parameters.Add(para.StringInputPara("@uom_name", uom_name));
            cmd.Parameters.Add(para.StringInputPara("@uom_discription", uom_discription));
            cmd.Parameters.Add(para.IntInputPara("@uom_is_active ", uom_is_active)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_get_all_uom_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_uom_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
        public static DataTable i_pi_unit_of_measure_mst_select_all_and_id(int uom_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_unit_of_measure_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@uom_id", uom_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_unit_of_measure_mst_delete(int uom_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_unit_of_measure_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@uom_id", uom_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}



