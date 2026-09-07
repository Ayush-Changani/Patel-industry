using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Purchase.BAL
{
    public class BAL_Purchase_Requisition
    {

        // ============================================================
        //  GET NEXT PR NUMBER
        //  Returns: Next sequence number for PR auto-numbering
        // ============================================================
        public static DataTable i_pi_get_next_pr_number()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_next_pr_number";
            cmd.CommandType = CommandType.StoredProcedure;
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT / UPDATE PR HEADER
        //  Returns: status_flag, status_message, purchase_requisition_id
        // ============================================================
        public static DataTable i_pi_purchase_requisition_insert_update(
            int pr_id,
            string pr_number,
            DateTime pr_required_by_date,
            int pr_entity_id,
            int pr_entity_group_id,
            int pr_department_id,
            int pr_store_location_id,
            int pr_requested_by_user_id,
            int pr_priority,
            string pr_purpose_justification,
            string pr_remarks,
            string pr_status
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_requisition_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pr_id", pr_id));
            cmd.Parameters.Add(para.StringInputPara("@pr_number", pr_number));
            cmd.Parameters.Add(para.DateInputPara("@pr_required_by_date", pr_required_by_date));
            cmd.Parameters.Add(para.IntInputPara("@pr_entity_id", pr_entity_id));
            cmd.Parameters.Add(para.IntInputPara("@pr_entity_group_id", pr_entity_group_id));
            cmd.Parameters.Add(para.IntInputPara("@pr_department_id", pr_department_id));
            cmd.Parameters.Add(para.IntInputPara("@pr_store_location_id", pr_store_location_id));
            cmd.Parameters.Add(para.IntInputPara("@pr_requested_by_user_id", pr_requested_by_user_id));
            cmd.Parameters.Add(para.IntInputPara("@pr_priority", pr_priority));
            cmd.Parameters.Add(para.StringInputPara("@pr_purpose_justification", pr_purpose_justification));
            cmd.Parameters.Add(para.StringInputPara("@pr_remarks", pr_remarks));
            cmd.Parameters.Add(para.StringInputPara("@pr_status", pr_status));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  INSERT PR ITEM ROW
        //  Called in a loop for each item in the repeater grid
        // ============================================================
        public static DataTable i_pi_purchase_requisition_item_insert(
            int pri_purchase_master_id,
            int pri_item_id,
            decimal pri_quantity,
            string pri_item_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_requisition_item_insert";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pri_purchase_master_id", pri_purchase_master_id));
            cmd.Parameters.Add(para.IntInputPara("@pri_item_id", pri_item_id));
            cmd.Parameters.Add(para.DecimalInputPara("@pri_quantity", pri_quantity));
            cmd.Parameters.Add(para.StringInputPara("@pri_item_remarks", pri_item_remarks));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  DELETE PR ITEMS BY MASTER ID
        //  Called before re-inserting items on edit
        // ============================================================
        public static DataTable i_pi_purchase_requisition_item_delete_by_master(
            int pri_purchase_master_id
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_requisition_item_delete_by_master";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pri_purchase_master_id", pri_purchase_master_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  SELECT ALL PR HEADERS / SELECT BY ID
        //  pr_id = 0  → returns all rows  (list page)
        //  pr_id > 0  → returns single row (form load)
        // ============================================================
        public static DataTable i_pi_purchase_requisition_select_all_and_id(int pr_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_requisition_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pr_id", pr_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  APPROVAL ACTION  (Approve / Reject)
        //  Returns: status_flag, status_message
        // ============================================================
        public static DataTable i_pi_purchase_requisition_approval_action(
            int pr_id,
            string action,
            int approved_by_user_id,
            string rejection_remarks
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_requisition_approval_action";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pr_id", pr_id));
            cmd.Parameters.Add(para.StringInputPara("@action", action));
            cmd.Parameters.Add(para.IntInputPara("@approved_by_user_id", approved_by_user_id));
            cmd.Parameters.Add(para.StringInputPara("@rejection_remarks", rejection_remarks ?? ""));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }


        // ============================================================
        //  DELETE PR
        //  Soft deletes the PR header; hard deletes items
        //  Blocks delete if status is Approved or Pending
        // ============================================================
        public static DataTable i_pi_purchase_requisition_delete(int pr_id)
        {   
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();
            cmd.CommandText = "i_pi_purchase_requisition_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(para.IntInputPara("@pr_id", pr_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

    }
}