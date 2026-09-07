using Backend.DAL;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Backend.MenuPermission.BAL
{
    public class BAL_MenuPermission
    {
        // ── Select All (for list page) ─────────────────────────────
        public static DataTable i_pi_menu_permission_select_all(string searchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_menu_permission_select_all";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", searchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Select By ID (for edit / view) ─────────────────────────
        public static DataTable i_pi_menu_permission_select_by_usr_id(int usr_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_menu_permission_select_by_usr_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@usr_id", usr_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Insert / Update ────────────────────────────────────────
        public static DataTable i_pi_menu_permission_insert(
            int id,
            int ugId,
            int usrId,
            int deptId,
            int isActive,
            string permissionsJson)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_menu_permission_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@ug_id", ugId));
            cmd.Parameters.Add(para.IntInputPara("@usr_id", usrId));
            cmd.Parameters.Add(para.IntInputPara("@dept_id", deptId));
            cmd.Parameters.Add(para.IntInputPara("@is_active", isActive));
            cmd.Parameters.Add(para.StringInputPara("@permissions", permissionsJson));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Delete ─────────────────────────────────────────────────
        public static DataTable i_pi_menu_permission_delete(int id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_menu_permission_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@id", id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Select all menus (for tree dropdown) ───────────────────
        public static DataTable i_pi_menu_detail_select_all_and_id()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_menu_detail_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}