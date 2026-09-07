using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Purchase.BAL
{
    public class BAL_Purchase_Quotation
    {

        // ============================================================
        //  GET NEXT PQ NUMBER
        //  Returns: Next sequence number for PQ auto-numbering
        // ============================================================
        public static DataTable i_pi_get_next_pq_number()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_next_pq_number";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT / UPDATE PQ HEADER
        //  Returns: status_flag, status_message, purchase_quotation_id
        // ============================================================
        public static DataTable i_pi_purchase_quotation_insert_update(
            int pq_id,
            string pq_number,
            DateTime pq_date,
            int pq_pr_id,
            string pq_title,
            string pq_notes,
            string pq_status,
            int pq_created_by_user_id
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            cmd.Parameters.Add(para.StringInputPara("@pq_number", pq_number));
            cmd.Parameters.Add(para.DateInputPara("@pq_date", pq_date));
            cmd.Parameters.Add(para.IntInputPara("@pq_pr_id", pq_pr_id));
            cmd.Parameters.Add(para.StringInputPara("@pq_title", pq_title));
            cmd.Parameters.Add(para.StringInputPara("@pq_notes", pq_notes));
            cmd.Parameters.Add(para.StringInputPara("@pq_status", pq_status));
            cmd.Parameters.Add(para.IntInputPara("@pq_created_by_user_id", pq_created_by_user_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT / UPDATE VENDOR QUOTE RECORD
        //  One row per vendor per quotation comparison
        //  Returns: status_flag, status_message, pqv_id
        // ============================================================
        public static DataTable i_pi_purchase_quotation_vendor_insert_update(
            int pqv_id,
            int pqv_purchase_quotation_id,
            int pqv_vendor_id,
            string pqv_quote_number,
            DateTime pqv_quote_date,
            DateTime? pqv_valid_upto,
            int pqv_delivery_days,
            string pqv_payment_terms,
            string pqv_currency,
            string pqv_remarks,
            bool pqv_is_selected,
            bool pqv_is_rejected
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_vendor_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pqv_id", pqv_id));
            cmd.Parameters.Add(para.IntInputPara("@pqv_purchase_quotation_id", pqv_purchase_quotation_id));
            cmd.Parameters.Add(para.IntInputPara("@pqv_vendor_id", pqv_vendor_id));
            cmd.Parameters.Add(para.StringInputPara("@pqv_quote_number", pqv_quote_number));
            cmd.Parameters.Add(para.DateInputPara("@pqv_quote_date", pqv_quote_date));
            // nullable date param
            if (pqv_valid_upto.HasValue)
                cmd.Parameters.Add(para.DateInputPara("@pqv_valid_upto", pqv_valid_upto.Value));
            else
                cmd.Parameters.AddWithValue("@pqv_valid_upto", DBNull.Value);
            cmd.Parameters.Add(para.IntInputPara("@pqv_delivery_days", pqv_delivery_days));
            cmd.Parameters.Add(para.StringInputPara("@pqv_payment_terms", pqv_payment_terms));
            cmd.Parameters.Add(para.StringInputPara("@pqv_currency", pqv_currency));
            cmd.Parameters.Add(para.StringInputPara("@pqv_remarks", pqv_remarks));
            cmd.Parameters.AddWithValue("@pqv_is_selected", pqv_is_selected);
            cmd.Parameters.AddWithValue("@pqv_is_rejected", pqv_is_rejected);
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT VENDOR QUOTE ITEM ROW
        //  Called in a loop for each item per vendor
        // ============================================================
        public static DataTable i_pi_purchase_quotation_vendor_item_insert(
            int pqvi_pqv_id,
            int pqvi_pr_item_id,
            decimal pqvi_unit_price,
            decimal pqvi_gst_percent,
            decimal pqvi_discount_percent,
            string pqvi_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_vendor_item_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pqvi_pqv_id", pqvi_pqv_id));
            cmd.Parameters.Add(para.IntInputPara("@pqvi_pr_item_id", pqvi_pr_item_id));
            cmd.Parameters.Add(para.DecimalInputPara("@pqvi_unit_price", pqvi_unit_price));
            cmd.Parameters.Add(para.DecimalInputPara("@pqvi_gst_percent", pqvi_gst_percent));
            cmd.Parameters.Add(para.DecimalInputPara("@pqvi_discount_percent", pqvi_discount_percent));
            cmd.Parameters.Add(para.StringInputPara("@pqvi_remarks", pqvi_remarks));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  DELETE VENDOR QUOTE ITEMS BY VENDOR ID
        //  Called before re-inserting items on edit
        // ============================================================
        public static DataTable i_pi_purchase_quotation_vendor_items_delete(int pqv_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_vendor_items_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pqv_id", pqv_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  DELETE ALL VENDOR RECORDS BY MASTER PQ ID
        //  Used on edit to clean and re-insert all vendor rows
        // ============================================================
        public static DataTable i_pi_purchase_quotation_vendors_delete_by_master(int pq_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_vendors_delete_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  SELECT ALL PQ HEADERS / SELECT BY ID
        //  pq_id = 0  → returns all rows  (list page)
        //  pq_id > 0  → returns single row (form load)
        // ============================================================
        public static DataTable i_pi_purchase_quotation_select_all_and_id(int pq_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  SELECT VENDOR QUOTES BY PQ ID
        //  Returns flat joined rows: vendor + items (for comparison grid)
        // ============================================================
        public static DataTable i_pi_purchase_quotation_vendors_select(int pq_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_vendors_select";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  APPROVAL ACTION  (Approve / Reject)
        //  Returns: status_flag, status_message
        // ============================================================
        public static DataTable i_pi_purchase_quotation_approval_action(
            int pq_id,
            string action,
            int approved_by_user_id,
            string rejection_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_approval_action";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            cmd.Parameters.Add(para.StringInputPara("@action", action));
            cmd.Parameters.Add(para.IntInputPara("@approved_by_user_id", approved_by_user_id));
            cmd.Parameters.Add(para.StringInputPara("@rejection_remarks", rejection_remarks ?? ""));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  FINALIZE — Lock comparison, mark selected vendor
        //  Called from frontend "Finalize & Select Vendor" button
        //  Returns: status_flag, status_message
        // ============================================================
        public static DataTable i_pi_purchase_quotation_finalize(
            int pq_id,
            int selected_pqv_id,
            int finalized_by_user_id
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_finalize";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            cmd.Parameters.Add(para.IntInputPara("@selected_pqv_id", selected_pqv_id));
            cmd.Parameters.Add(para.IntInputPara("@finalized_by_user_id", finalized_by_user_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  DELETE PQ
        //  Soft deletes header; hard deletes vendor + item rows
        //  Blocks delete if status is Approved / Finalized
        // ============================================================
        public static DataTable i_pi_purchase_quotation_delete(int pq_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_quotation_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

    }
}