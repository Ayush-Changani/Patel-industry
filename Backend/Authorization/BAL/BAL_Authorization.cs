using Backend.DAL;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Backend.Authorization.BAL
{
    public class BAL_Authorization
    {
        // ── Login: get user + group ────────────────────────────────
        public static DataTable i_pi_auth_login(string email)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_auth_login";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@email", email));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Get menu permissions for logged-in user ────────────────
        //    Called after login to return allowed menus + permission flags
        public static DataTable i_pi_get_user_menu_permissions(int userId)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_get_user_menu_permissions";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@usr_id", userId));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Insert refresh token ───────────────────────────────────
        public static DataTable i_pi_refresh_token_insert(
            int userId,
            string tokenHash,
            DateTime expiry)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_refresh_token_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@rft_usr_id", userId));
            cmd.Parameters.Add(para.StringInputPara("@rft_token_hash", tokenHash));
            cmd.Parameters.Add(para.DateTimeInputPara("@rft_expiry", expiry));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Validate refresh token ─────────────────────────────────
        public static DataTable i_pi_refresh_token_validate(string tokenHash)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_refresh_token_validate";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@rft_token_hash", tokenHash));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Revoke refresh token ───────────────────────────────────
        public static DataTable i_pi_refresh_token_revoke(int userId)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_refresh_token_revoke";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@rft_usr_id", userId));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Cleanup expired tokens ─────────────────────────────────
        public static DataTable i_pi_refresh_token_cleanup()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_refresh_token_cleanup";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── Get ALL menus for admin ────────────────────────────────────────────────
        public static DataTable i_pi_get_all_menus_for_admin()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_menus_for_admin";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}