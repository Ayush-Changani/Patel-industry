using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Config.Master.BAL
{
    public class BAL_Company_master
    {
        public static DataTable i_pi_company_mst_detail_insert(
           int com_id,
           string com_name,
           string com_person,
           string com_address,
           string com_city,
           string com_taluka,
           string com_district,
           string com_state,
           string com_country,
           string com_pincode,
           string com_contact_number,
           string com_alternate_number,
           string com_email,
           string com_website,
           string com_gst_no,
           string com_upload_logo,
           int com_status
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_company_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.IntInputPara("@com_id", com_id));
            cmd.Parameters.Add(p.StringInputPara("@com_name", com_name));
            cmd.Parameters.Add(p.StringInputPara("@com_person", com_person));
            cmd.Parameters.Add(p.StringInputPara("@com_address", com_address));

            cmd.Parameters.Add(p.StringInputPara("@com_city", com_city));
            cmd.Parameters.Add(p.StringInputPara("@com_taluka", com_taluka));
            cmd.Parameters.Add(p.StringInputPara("@com_district", com_district));
            cmd.Parameters.Add(p.StringInputPara("@com_state", com_state));
            cmd.Parameters.Add(p.StringInputPara("@com_country", com_country));

            cmd.Parameters.Add(p.StringInputPara("@com_pincode", com_pincode));
            cmd.Parameters.Add(p.StringInputPara("@com_contact_number", com_contact_number));
            cmd.Parameters.Add(p.StringInputPara("@com_alternate_number", com_alternate_number));

            cmd.Parameters.Add(p.StringInputPara("@com_email", com_email));
            cmd.Parameters.Add(p.StringInputPara("@com_website", com_website));
            cmd.Parameters.Add(p.StringInputPara("@com_gst_no", com_gst_no));
            cmd.Parameters.Add(p.StringInputPara("@com_upload_logo", com_upload_logo));
            cmd.Parameters.Add(p.IntInputPara("@com_status", com_status));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_company_mst_select_all_and_id(int com_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_company_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@com_id", com_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_company_mst_delete(int com_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter(); 
            cmd.CommandText = "i_pi_company_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.IntInputPara("@com_id", com_id)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        public static DataTable i_pi_get_all_company_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_all_company_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);

            return dt;
        }
    }
}
