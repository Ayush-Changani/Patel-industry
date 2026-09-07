using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Purchase.BAL
{
    public class BAL_Purchase_Inquiry
    {

        // ============================================================
        //  GET NEXT PI NUMBER
        //  Returns: Next sequence number for PI auto-numbering
        // ============================================================
        public static DataTable i_pi_get_next_pi_number()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_next_pi_number";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  GET APPROVED PR DDL
        //  Returns: Only PRs with status = 'Approved' for dropdown
        // ============================================================
        public static DataTable i_pi_get_approved_pr_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_get_approved_pr_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm ?? ""));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  GET VENDOR DDL
        //  Returns: Active vendor list for dropdown
        // ============================================================
        public static DataTable i_pi_get_vendor_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_get_vendor_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.StringInputPara("@SearchTerm", SearchTerm ?? ""));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  GET PR ITEMS BY PR ID
        //  Returns: All items under a selected PR for item grid
        // ============================================================
        public static DataTable i_pi_purchase_requisition_items_select_by_master(int pr_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_requisition_items_select_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pr_id", pr_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT / UPDATE PI HEADER
        //  Returns: status_flag, status_message, purchase_inquiry_id
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_insert_update(
            int pi_id,
            string pi_number,
            int pi_pr_id,
            int pi_entity_id,
            int pi_entity_group_id,
            int pi_department_id,
            DateTime pi_expected_delivery_date,
            string pi_terms_conditions,
            string pi_remarks,
            int pi_prepared_by_user_id,
            string pi_status
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pi_id", pi_id));
            cmd.Parameters.Add(para.StringInputPara("@pi_number", pi_number));
            cmd.Parameters.Add(para.IntInputPara("@pi_pr_id", pi_pr_id));
            cmd.Parameters.Add(para.IntInputPara("@pi_entity_id", pi_entity_id));
            cmd.Parameters.Add(para.IntInputPara("@pi_entity_group_id", pi_entity_group_id));
            cmd.Parameters.Add(para.IntInputPara("@pi_department_id", pi_department_id));
            cmd.Parameters.Add(para.DateInputPara("@pi_expected_delivery_date", pi_expected_delivery_date));
            cmd.Parameters.Add(para.StringInputPara("@pi_terms_conditions", pi_terms_conditions));
            cmd.Parameters.Add(para.StringInputPara("@pi_remarks", pi_remarks));
            cmd.Parameters.Add(para.IntInputPara("@pi_prepared_by_user_id", pi_prepared_by_user_id));
            cmd.Parameters.Add(para.StringInputPara("@pi_status", pi_status));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT PI ITEM ROW
        //  Called in a loop for each item in the item grid
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_item_insert(
            int pii_purchase_inquiry_master_id,
            int pii_pr_item_id,
            int pii_item_id,
            decimal pii_quantity,
            string pii_item_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_item_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pii_purchase_inquiry_master_id", pii_purchase_inquiry_master_id));
            cmd.Parameters.Add(para.IntInputPara("@pii_pr_item_id", pii_pr_item_id));
            cmd.Parameters.Add(para.IntInputPara("@pii_item_id", pii_item_id));
            cmd.Parameters.Add(para.DecimalInputPara("@pii_quantity", pii_quantity));
            cmd.Parameters.Add(para.StringInputPara("@pii_item_remarks", pii_item_remarks));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  DELETE PI ITEMS BY MASTER ID
        //  Called before re-inserting items on edit
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_item_delete_by_master(
            int pii_purchase_inquiry_master_id
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_item_delete_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pii_purchase_inquiry_master_id", pii_purchase_inquiry_master_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT PI VENDOR ROW
        //  Called in a loop for each vendor in the vendor grid
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_vendor_insert(
            int piv_purchase_inquiry_master_id,
            int piv_vendor_id,
            string piv_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_vendor_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@piv_purchase_inquiry_master_id", piv_purchase_inquiry_master_id));
            cmd.Parameters.Add(para.IntInputPara("@piv_vendor_id", piv_vendor_id));
            cmd.Parameters.Add(para.StringInputPara("@piv_remarks", piv_remarks));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  DELETE PI VENDORS BY MASTER ID
        //  Called before re-inserting vendors on edit
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_vendor_delete_by_master(
            int piv_purchase_inquiry_master_id
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_vendor_delete_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@piv_purchase_inquiry_master_id", piv_purchase_inquiry_master_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  SELECT ALL PI HEADERS / SELECT BY ID
        //  pi_id = 0  → returns all rows  (list page)
        //  pi_id > 0  → returns single row (form load)
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_select_all_and_id(int pi_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pi_id", pi_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  SELECT PI ITEMS BY MASTER ID
        //  Called after header is loaded on edit / view
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_items_select_by_master(int pi_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_items_select_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pi_id", pi_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  SELECT PI VENDORS BY MASTER ID
        //  Called after header is loaded on edit / view
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_vendors_select_by_master(int pi_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_vendors_select_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pi_id", pi_id));
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


        // ============================================================
        //  DELETE PI
        //  Soft deletes the PI header; hard deletes items & vendors
        //  Blocks delete if status is Sent, Approved or Closed
        // ============================================================
        public static DataTable i_pi_purchase_inquiry_delete(int pi_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_inquiry_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pi_id", pi_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

    }
}