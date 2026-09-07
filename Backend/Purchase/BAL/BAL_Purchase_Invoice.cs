using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Purchase.BAL
{
    public class BAL_Purchase_Invoice
    {

        // ============================================================
        //  GET NEXT Invoice NUMBER
        // ============================================================
        public static DataTable i_pi_purchase_invoice_generate_number()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_purchase_invoice_generate_number";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        // INSERT / UPDATE PURCHASE INVOICE HEADER
        // ============================================================
        public static DataTable i_pi_purchase_invoice_insert_update(
            int pinv_id,
            string pinv_number,
            DateTime pinv_date,
            int pinv_po_id,
            int pinv_grn_id,
            int pinv_vendor_id,
            DateTime pinv_due_date,
            decimal pinv_total_amount,
            string pinv_status,
            int pinv_created_by_user_id,
            string pinv_rejection_remarks,
            int pinv_approved_by_user_id
        )
         {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_purchase_invoice_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@pinv_id", pinv_id));
            cmd.Parameters.Add(para.StringInputPara("@pinv_number", pinv_number));
            cmd.Parameters.Add(para.DateInputPara("@pinv_date", pinv_date));
            cmd.Parameters.Add(para.IntInputPara("@pinv_po_id", pinv_po_id));
            cmd.Parameters.Add(para.IntInputPara("@pinv_grn_id", pinv_grn_id));
            cmd.Parameters.Add(para.IntInputPara("@pinv_vendor_id", pinv_vendor_id));
            cmd.Parameters.Add(para.DateInputPara("@pinv_due_date", pinv_due_date));
            cmd.Parameters.Add(para.DecimalInputPara("@pinv_total_amount", pinv_total_amount));
            cmd.Parameters.Add(para.StringInputPara("@pinv_status", pinv_status));
            cmd.Parameters.Add(para.IntInputPara("@pinv_created_by_user_id", pinv_created_by_user_id));
            cmd.Parameters.Add(para.StringInputPara("@pinv_rejection_remarks", pinv_rejection_remarks));
            cmd.Parameters.Add(para.IntInputPara("@pinv_approved_by_user_id", pinv_approved_by_user_id));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }



        // ============================================================
        // SAVE PURCHASE INVOICE ITEMS (TVP)
        // ============================================================
        public static DataTable i_pi_purchase_invoice_items_save(
            int pinv_id,
            DataTable itemsTable
        )
        {
            SqlCommand cmd = new SqlCommand();

            cmd.CommandText = "i_pi_purchase_invoice_items_save";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@pinv_id", pinv_id);

            SqlParameter tvp = cmd.Parameters.AddWithValue("@items", itemsTable);
            tvp.SqlDbType = SqlDbType.Structured;
            tvp.TypeName = "tvp_pi_purchase_invoice_items";

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }



        // ============================================================
        // SELECT ALL / SELECT BY ID
        // ============================================================
        public static DataTable i_pi_purchase_invoice_select_all_and_id(int pinv_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_purchase_invoice_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@pinv_id", pinv_id));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }



        // ============================================================
        // SELECT ITEMS BY INVOICE ID
        // ============================================================
        public static DataTable i_pi_purchase_invoice_items_select(int pinv_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_purchase_invoice_items_select";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@pinv_id", pinv_id));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }



        // ============================================================
        // DELETE PURCHASE INVOICE
        // ============================================================
        public static DataTable i_pi_purchase_invoice_delete(int pinv_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_purchase_invoice_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@pinv_id", pinv_id));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }



        // ============================================================
        // GRN DROPDOWN BY PO
        // ============================================================
        public static DataTable i_pi_get_grn_by_po_id(int po_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_get_grn_by_po_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }



        // ============================================================
        // GRN ITEMS FOR GRID
        // ============================================================
        public static DataTable i_pi_get_grn_items_by_grn_id(int grn_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_pi_get_grn_items_by_grn_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@grn_id", grn_id));

            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ============================================================
        //  APPROVAL ACTION  (Approve / Reject)
        //  Called : From PI List page Approve / Reject button
        //  Flow   : Sent → Approved  |  Sent → Rejected
        //  Returns: status_flag, status_message
        // ============================================================
        public static DataTable i_pi_common_approval_action(
             string module_name,
             int reference_id,
             string reference_number,
             string action,
             int action_by_user_id,
             string remarks = ""
         )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_common_approval_action";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@module_name", module_name));
            cmd.Parameters.Add(para.IntInputPara("@reference_id", reference_id));
            cmd.Parameters.Add(para.StringInputPara("@reference_number", reference_number));
            cmd.Parameters.Add(para.StringInputPara("@action", action));
            cmd.Parameters.Add(para.IntInputPara("@action_by_user_id", action_by_user_id));
            cmd.Parameters.Add(para.StringInputPara("@remarks", remarks ?? ""));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

    }
}