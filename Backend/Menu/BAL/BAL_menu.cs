using Microsoft.Data.SqlClient;
using System;
using System.Data;
using Backend.DAL;

namespace Backend.Menu.BAL
{
    public class BAL_menu
    {
        public static DataTable i_pi_get_all_master_menu_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_master_menu_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }

        public static DataTable i_pi_menu_detail_insert(
        int id,
        string md_master_menu_id,
        string md_sub_menu_name,
        string md_page_url_1,
        string md_page_url_2,
        string md_company_id,
        string md_icon,
        int md_status
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_menu_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.IntInputPara("@id", id));
            cmd.Parameters.Add(p.StringInputPara("@md_master_menu_id", md_master_menu_id));
            cmd.Parameters.Add(p.StringInputPara("@md_sub_menu_name", md_sub_menu_name));
            cmd.Parameters.Add(p.StringInputPara("@md_page_url_1", md_page_url_1));
            cmd.Parameters.Add(p.StringInputPara("@md_page_url_2", md_page_url_2));
            cmd.Parameters.Add(p.StringInputPara("@md_icon", md_icon));
            cmd.Parameters.Add(p.StringInputPara("@md_company_id", md_company_id));
            cmd.Parameters.Add(p.IntInputPara("@md_status", md_status));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_menu_detail_select_all_and_id(int id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_menu_detail_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@id", id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_menu_detail_delete(int id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_menu_detail_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.IntInputPara("@id", id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
                 