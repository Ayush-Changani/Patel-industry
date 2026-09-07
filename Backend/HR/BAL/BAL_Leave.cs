using Microsoft.Data.SqlClient;
using System;
using System.Data;
using Backend.DAL;

namespace Backend.HR.BAL
{
    public class BAL_Leave
    {
        public static DataTable i_pi_leave_request_insert(int empId, string type, DateTime from, DateTime to, string reason)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_leave_request_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.IntInputPara("@lr_employee_id", empId));
            cmd.Parameters.Add(p.StringInputPara("@lr_leave_type", type));
            cmd.Parameters.Add(p.DateInputPara("@lr_from_date", from));
            cmd.Parameters.Add(p.DateInputPara("@lr_to_date", to));
            cmd.Parameters.Add(p.StringInputPara("@lr_reason", reason ?? ""));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable i_pi_leave_request_get(int empId)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_leave_request_get";
            cmd.CommandType = CommandType.StoredProcedure;

            if (empId > 0)
                cmd.Parameters.Add(p.IntInputPara("@lr_employee_id", empId));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable i_pi_leave_balance_get(int empId)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_leave_balance_get";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.IntInputPara("@lb_employee_id", empId));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable i_pi_common_approval_action(int id, string action, int userId, string remarks)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_common_approval_action";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.StringInputPara("@module_name", "LeaveRequest"));
            cmd.Parameters.Add(p.IntInputPara("@reference_id", id));    
            cmd.Parameters.Add(p.StringInputPara("@reference_number", "LR-" + id));
            cmd.Parameters.Add(p.StringInputPara("@action", action));
            cmd.Parameters.Add(p.IntInputPara("@action_by_user_id", userId));
            cmd.Parameters.Add(p.StringInputPara("@remarks", remarks ?? ""));

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable i_pi_leave_request_approval_action(int lr_id, string action, int userId, string remarks)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();

            cmd.CommandText = "i_pi_leave_request_approval_action";  
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.IntInputPara("@lr_id", lr_id));
            cmd.Parameters.Add(p.StringInputPara("@action", action));
            cmd.Parameters.Add(p.IntInputPara("@approved_by_user_id", userId));
            cmd.Parameters.Add(p.StringInputPara("@rejection_remarks", remarks ?? ""));

            DataTable dt =  CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}