using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Purchase.BAL
{
    public class BAL_GRN
    {

        // ============================================================
        //  GET NEXT GRN NUMBER
        // ============================================================
        public static DataTable i_pi_get_next_grn_number()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_next_grn_number";
            cmd.CommandType = CommandType.StoredProcedure;
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  PRE-FILL FROM APPROVED PO
        // ============================================================
        public static DataTable i_pi_grn_prefill_from_po(int po_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_prefill_from_po";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  INSERT / UPDATE GRN HEADER
        // ============================================================
        public static DataTable i_pi_grn_insert_update(
            int grn_id,
            string grn_number,
            int grn_po_id,
            int grn_vendor_id,
            DateTime grn_received_date,
            string grn_delivery_challan_number,
            int grn_store_location_id,
            string grn_remarks,
            string grn_status,
            int grn_created_by_user_id
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@grn_id", grn_id));
            cmd.Parameters.Add(para.StringInputPara("@grn_number", grn_number));
            cmd.Parameters.Add(para.IntInputPara("@grn_po_id", grn_po_id));
            cmd.Parameters.Add(para.IntInputPara("@grn_vendor_id", grn_vendor_id));
            cmd.Parameters.Add(para.DateInputPara("@grn_received_date", grn_received_date));
            cmd.Parameters.Add(para.StringInputPara("@grn_delivery_challan_number", grn_delivery_challan_number ?? ""));
            cmd.Parameters.Add(para.IntInputPara("@grn_store_location_id", grn_store_location_id));
            cmd.Parameters.Add(para.StringInputPara("@grn_remarks", grn_remarks ?? ""));
            cmd.Parameters.Add(para.StringInputPara("@grn_status", grn_status ?? "Draft"));
            cmd.Parameters.Add(para.IntInputPara("@grn_created_by_user_id", grn_created_by_user_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  INSERT GRN ITEM ROW
        // ============================================================
        public static DataTable i_pi_grn_item_insert(
            int grni_grn_id,
            int grni_po_item_id,
            int grni_item_id,
            decimal grni_ordered_qty,
            decimal grni_received_qty,
            decimal grni_rejected_qty,
            string grni_discrepancy_notes,
            decimal grni_unit_price,
            decimal grni_gst_percent
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_item_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@grni_grn_id", grni_grn_id));
            cmd.Parameters.Add(para.IntInputPara("@grni_po_item_id", grni_po_item_id));
            cmd.Parameters.Add(para.IntInputPara("@grni_item_id", grni_item_id));
            cmd.Parameters.Add(para.DecimalInputPara("@grni_ordered_qty", grni_ordered_qty));
            cmd.Parameters.Add(para.DecimalInputPara("@grni_received_qty", grni_received_qty));
            cmd.Parameters.Add(para.DecimalInputPara("@grni_rejected_qty", grni_rejected_qty));
            cmd.Parameters.Add(para.StringInputPara("@grni_discrepancy_notes", grni_discrepancy_notes ?? ""));
            cmd.Parameters.Add(para.DecimalInputPara("@grni_unit_price", grni_unit_price));
            cmd.Parameters.Add(para.DecimalInputPara("@grni_gst_percent", grni_gst_percent));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  DELETE ALL ITEMS BY GRN ID
        // ============================================================
        public static DataTable i_pi_grn_items_delete_by_grn(int grn_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_items_delete_by_grn";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@grn_id", grn_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  SELECT ALL / BY ID
        // ============================================================
        public static DataTable i_pi_grn_select_all_and_id(int grn_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@grn_id", grn_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  SELECT ITEMS BY GRN ID
        // ============================================================
        public static DataTable i_pi_grn_items_select(int grn_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_items_select";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@grn_id", grn_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  APPROVAL ACTION
        // ============================================================
        public static DataTable i_pi_grn_approval_action(
            int grn_id,
            string action,
            int approved_by_user_id,
            string grn_rejection_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_approval_action";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@grn_id", grn_id));
            cmd.Parameters.Add(para.StringInputPara("@action", action));
            cmd.Parameters.Add(para.IntInputPara("@approved_by_user_id", approved_by_user_id));
            cmd.Parameters.Add(para.StringInputPara("@grn_rejection_remarks", grn_rejection_remarks ?? ""));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  DELETE GRN
        // ============================================================
        public static DataTable i_pi_grn_delete(int grn_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_grn_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@grn_id", grn_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  GET APPROVED PO DROPDOWN
        // ============================================================
        public static DataTable i_pi_get_approved_po_ddl(string searchTerm = "")
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_get_approved_po_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", searchTerm ?? ""));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  GET STORE LOCATION DROPDOWN
        // ============================================================
        public static DataTable i_pi_get_store_location_ddl()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_store_location_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}