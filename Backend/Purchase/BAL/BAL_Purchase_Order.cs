using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Purchase.BAL
{
    public class BAL_Purchase_Order
    {

        // ============================================================
        //  GET NEXT PO NUMBER
        // ============================================================
        public static DataTable i_pi_get_next_po_number()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_next_po_number";
            cmd.CommandType = CommandType.StoredProcedure;
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  PRE-FILL FROM FINALIZED QUOTATION
        //  Returns flat rows: one per item from the winning vendor
        // ============================================================
        public static DataTable i_pi_purchase_order_prefill_from_pq(int pq_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_prefill_from_pq";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pq_id", pq_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  INSERT / UPDATE PO HEADER
        //  Returns: status_flag, status_message, purchase_order_id
        // ============================================================
        public static DataTable i_pi_purchase_order_insert_update(
            int po_id,
            string po_number,
            DateTime po_date,
            int po_pq_id,
            int po_vendor_id,
            int po_entity_id,
            int po_department_id,
            DateTime po_expected_delivery,
            string po_supply_type,
            string po_delivery_address,
            string po_terms_conditions,
            string po_remarks,
            string po_status,
            int po_created_by_user_id
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));
            cmd.Parameters.Add(para.StringInputPara("@po_number", po_number));
            cmd.Parameters.Add(para.DateInputPara("@po_date", po_date));
            cmd.Parameters.Add(para.IntInputPara("@po_pq_id", po_pq_id));
            cmd.Parameters.Add(para.IntInputPara("@po_vendor_id", po_vendor_id));
            cmd.Parameters.Add(para.IntInputPara("@po_entity_id", po_entity_id));
            cmd.Parameters.Add(para.IntInputPara("@po_department_id", po_department_id));
            cmd.Parameters.Add(para.DateInputPara("@po_expected_delivery", po_expected_delivery));
            cmd.Parameters.Add(para.StringInputPara("@po_supply_type", po_supply_type));
            cmd.Parameters.Add(para.StringInputPara("@po_delivery_address", po_delivery_address));
            cmd.Parameters.Add(para.StringInputPara("@po_terms_conditions", po_terms_conditions));
            cmd.Parameters.Add(para.StringInputPara("@po_remarks", po_remarks));
            cmd.Parameters.Add(para.StringInputPara("@po_status", po_status));
            cmd.Parameters.Add(para.IntInputPara("@po_created_by_user_id", po_created_by_user_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  INSERT PO ITEM ROW
        //  Called in a loop for each item
        // ============================================================
        public static DataTable i_pi_purchase_order_item_insert(
            int poi_po_id,
            int poi_item_id,
            int poi_pr_item_id,
            decimal poi_qty,
            decimal poi_unit_price,
            decimal poi_discount_percent,
            decimal poi_gst_percent,
            string poi_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_item_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@poi_po_id", poi_po_id));
            cmd.Parameters.Add(para.IntInputPara("@poi_item_id", poi_item_id));
            cmd.Parameters.Add(para.IntInputPara("@poi_pr_item_id", poi_pr_item_id));
            cmd.Parameters.Add(para.DecimalInputPara("@poi_qty", poi_qty));
            cmd.Parameters.Add(para.DecimalInputPara("@poi_unit_price", poi_unit_price));
            cmd.Parameters.Add(para.DecimalInputPara("@poi_discount_percent", poi_discount_percent));
            cmd.Parameters.Add(para.DecimalInputPara("@poi_gst_percent", poi_gst_percent));
            cmd.Parameters.Add(para.StringInputPara("@poi_remarks", poi_remarks));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  DELETE PO ITEMS BY MASTER ID (called before re-insert on edit)
        // ============================================================
        public static DataTable i_pi_purchase_order_items_delete_by_master(int po_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_items_delete_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  SELECT ALL PO HEADERS / SELECT BY ID
        //  po_id = 0 → all rows (list page)
        //  po_id > 0 → single row (form load)
        // ============================================================
        public static DataTable i_pi_purchase_order_select_all_and_id(int po_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  SELECT PO ITEMS BY PO ID
        // ============================================================
        public static DataTable i_pi_purchase_order_items_select(int po_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_items_select";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  APPROVAL ACTION (Approved / Rejected / SendBack)
        // ============================================================
        public static DataTable i_pi_purchase_order_approval_action(
            int po_id,
            string action,
            int approved_by_user_id,
            string rejection_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_approval_action";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));
            cmd.Parameters.Add(para.StringInputPara("@action", action));
            cmd.Parameters.Add(para.IntInputPara("@approved_by_user_id", approved_by_user_id));
            cmd.Parameters.Add(para.StringInputPara("@rejection_remarks", rejection_remarks ?? ""));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  DELETE PO
        //  Soft-deletes header; hard-deletes items
        //  Blocks delete if status is Approved
        // ============================================================
        public static DataTable i_pi_purchase_order_delete(int po_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_order_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@po_id", po_id));
            return CreateCommand.ExecuteQuery(cmd);
        }


        // ============================================================
        //  GET FINALIZED PQ DDL
        //  Returns: Only PRs with status = 'Finalized' for dropdown
        // ============================================================
        public static DataTable i_pi_get_finalized_pq_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_get_finalized_pq_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm ?? ""));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


    }
}