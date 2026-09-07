using Backend.DAL;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Backend.Entity.BAL
{
    public class BAL_Vendor_Customer_cnt
    {
        public static DataTable i_pi_vendor_and_customer_insert(
        int vc_id,
        int vc_group_name,
        string vc_vendor_name,
        string vc_vendor_address,
        string vc_gst_number,
        string vc_contact_parson,
        string vc_contact_number,
        int vc_is_vendor,
        int vc_is_customer
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_vendor_and_customer_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@vc_id", vc_id));
            cmd.Parameters.Add(para.IntInputPara("@vc_group_name", vc_group_name));
            cmd.Parameters.Add(para.StringInputPara("@vc_vendor_name", vc_vendor_name));
            cmd.Parameters.Add(para.StringInputPara("@vc_vendor_address", vc_vendor_address));
            cmd.Parameters.Add(para.StringInputPara("@vc_gst_number", vc_gst_number));
            cmd.Parameters.Add(para.StringInputPara("@vc_contact_parson", vc_contact_parson));
            cmd.Parameters.Add(para.StringInputPara("@vc_contact_number", vc_contact_number));
            cmd.Parameters.Add(para.IntInputPara("@vc_is_vendor", vc_is_vendor));
            cmd.Parameters.Add(para.IntInputPara("@vc_is_customer", vc_is_customer));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_vendor_and_customer_cnt_select_all_and_id(int vc_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_vendor_and_customer_cnt_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@vc_id", vc_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
        public static DataTable i_pi_vendor_and_customer_cnt_delete(int vc_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_vendor_and_customer_cnt_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@vc_id", vc_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}
