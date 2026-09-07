using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.HR.BAL
{
    public class BAL_Designation_Master
    {
        // ── GET NEXT CODE ──────────────────────────────────────────────────────
        public static DataTable i_pi_get_next_designation_code()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_next_designation_code";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── INSERT / UPDATE ────────────────────────────────────────────────────
        public static DataTable i_pi_designation_mst_detail_insert(
            int     des_id,
            string  des_name,
            string  des_code,
            int     des_department_id,
            string  des_level,
            int     des_reports_to,
            string  des_currency,
            decimal des_min_ctc,
            decimal des_max_ctc,
            int     des_status
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_designation_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.IntInputPara("@des_id",            des_id));
            cmd.Parameters.Add(p.StringInputPara("@des_name",       des_name));
            cmd.Parameters.Add(p.StringInputPara("@des_code",       des_code));
            cmd.Parameters.Add(p.IntInputPara("@des_department_id", des_department_id));
            cmd.Parameters.Add(p.StringInputPara("@des_level",      des_level));
            cmd.Parameters.Add(p.IntInputPara("@des_reports_to",    des_reports_to));
            cmd.Parameters.Add(p.StringInputPara("@des_currency",   des_currency));
            cmd.Parameters.Add(p.DecimalInputPara("@des_min_ctc",   des_min_ctc));
            cmd.Parameters.Add(p.DecimalInputPara("@des_max_ctc",   des_max_ctc));
            cmd.Parameters.Add(p.IntInputPara("@des_status",        des_status));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── SELECT ALL / BY ID ─────────────────────────────────────────────────
        public static DataTable i_pi_designation_mst_select_all_and_id(int des_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_designation_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.IntInputPara("@des_id", des_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── DELETE ─────────────────────────────────────────────────────────────
        public static DataTable i_pi_designation_mst_delete(int des_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_designation_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.IntInputPara("@des_id", des_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── DDL (DROPDOWN) ─────────────────────────────────────────────────────
        public static DataTable i_pi_get_all_designation_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_get_all_designation_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}