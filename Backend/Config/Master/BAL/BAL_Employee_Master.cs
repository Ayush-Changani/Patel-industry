using Microsoft.Data.SqlClient;
using System.Data;
using Backend.DAL;

namespace Backend.Config.Master.BAL
{
    public class BAL_Employee_Master
    {
        // ── GET NEXT EMPLOYEE CODE ─────────────────────────────────────────────
        public static DataTable i_pi_get_next_employee_code()
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_get_next_employee_code";
            cmd.CommandType = CommandType.StoredProcedure;
            return CreateCommand.ExecuteQuery(cmd);
        }

        // ── INSERT / UPDATE ────────────────────────────────────────────────────
        public static DataTable i_pi_employee_mst_detail_insert(
            int emp_id,
            string emp_code,
            // Personal
            string emp_first_name,
            string emp_last_name,
            string emp_dob,
            string emp_gender,
            string emp_blood_group,
            string emp_marital_status,
            string emp_mobile,
            string emp_alternate_mobile,
            string emp_personal_email,
            string emp_aadhar,
            string emp_pan,
            // Address
            string emp_address,
            int emp_city,
            int emp_taluka,
            int emp_district,
            int emp_state,
            int emp_country,
            string emp_pincode,
            // Photo
            string emp_photo,
            // Job
            string emp_doj,
            string emp_type,
            int emp_department_id,
            int emp_designation_id,
            int emp_reporting_manager_id,
            string emp_work_location,
            string emp_shift,
            string emp_work_email,
            int emp_probation_months,
            string emp_confirmation_date,
            decimal emp_ctc,
            // Documents
            string emp_doc_aadhar,
            string emp_doc_pan,
            string emp_doc_offer,
            string emp_doc_experience,
            string emp_doc_education,
            string emp_doc_other,
            string emp_doc_other_label,
            // Bank
            string emp_bank_name,
            string emp_account_number,
            string emp_ifsc_code,
            string emp_account_type,
            string emp_branch_name,
            string emp_upi_id,
            // Status
            int emp_status
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_employee_mst_detail_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(p.IntInputPara("@emp_id", emp_id));
            cmd.Parameters.Add(p.StringInputPara("@emp_code", emp_code));
            cmd.Parameters.Add(p.StringInputPara("@emp_first_name", emp_first_name));
            cmd.Parameters.Add(p.StringInputPara("@emp_last_name", emp_last_name));
            cmd.Parameters.Add(p.StringInputPara("@emp_dob", emp_dob));
            cmd.Parameters.Add(p.StringInputPara("@emp_gender", emp_gender));
            cmd.Parameters.Add(p.StringInputPara("@emp_blood_group", emp_blood_group));
            cmd.Parameters.Add(p.StringInputPara("@emp_marital_status", emp_marital_status));
            cmd.Parameters.Add(p.StringInputPara("@emp_mobile", emp_mobile));
            cmd.Parameters.Add(p.StringInputPara("@emp_alternate_mobile", emp_alternate_mobile));
            cmd.Parameters.Add(p.StringInputPara("@emp_personal_email", emp_personal_email));
            cmd.Parameters.Add(p.StringInputPara("@emp_aadhar", emp_aadhar));
            cmd.Parameters.Add(p.StringInputPara("@emp_pan", emp_pan));
            cmd.Parameters.Add(p.StringInputPara("@emp_address", emp_address));
            cmd.Parameters.Add(p.IntInputPara("@emp_city", emp_city));
            cmd.Parameters.Add(p.IntInputPara("@emp_taluka", emp_taluka));
            cmd.Parameters.Add(p.IntInputPara("@emp_district", emp_district));
            cmd.Parameters.Add(p.IntInputPara("@emp_state", emp_state));
            cmd.Parameters.Add(p.IntInputPara("@emp_country", emp_country));
            cmd.Parameters.Add(p.StringInputPara("@emp_pincode", emp_pincode));
            cmd.Parameters.Add(p.StringInputPara("@emp_photo", emp_photo));
            cmd.Parameters.Add(p.StringInputPara("@emp_doj", emp_doj));
            cmd.Parameters.Add(p.StringInputPara("@emp_type", emp_type));
            cmd.Parameters.Add(p.IntInputPara("@emp_department_id", emp_department_id));
            cmd.Parameters.Add(p.IntInputPara("@emp_designation_id", emp_designation_id));
            cmd.Parameters.Add(p.IntInputPara("@emp_reporting_manager_id", emp_reporting_manager_id));
            cmd.Parameters.Add(p.StringInputPara("@emp_work_location", emp_work_location));
            cmd.Parameters.Add(p.StringInputPara("@emp_shift", emp_shift));
            cmd.Parameters.Add(p.StringInputPara("@emp_work_email", emp_work_email));
            cmd.Parameters.Add(p.IntInputPara("@emp_probation_months", emp_probation_months));
            cmd.Parameters.Add(p.StringInputPara("@emp_confirmation_date", emp_confirmation_date));
            cmd.Parameters.Add(p.DecimalInputPara("@emp_ctc", emp_ctc));
            cmd.Parameters.Add(p.StringInputPara("@emp_doc_aadhar", emp_doc_aadhar));
            cmd.Parameters.Add(p.StringInputPara("@emp_doc_pan", emp_doc_pan));
            cmd.Parameters.Add(p.StringInputPara("@emp_doc_offer", emp_doc_offer));
            cmd.Parameters.Add(p.StringInputPara("@emp_doc_experience", emp_doc_experience));
            cmd.Parameters.Add(p.StringInputPara("@emp_doc_education", emp_doc_education));
            cmd.Parameters.Add(p.StringInputPara("@emp_doc_other", emp_doc_other));
            cmd.Parameters.Add(p.StringInputPara("@emp_doc_other_label", emp_doc_other_label));
            cmd.Parameters.Add(p.StringInputPara("@emp_bank_name", emp_bank_name));
            cmd.Parameters.Add(p.StringInputPara("@emp_account_number", emp_account_number));
            cmd.Parameters.Add(p.StringInputPara("@emp_ifsc_code", emp_ifsc_code));
            cmd.Parameters.Add(p.StringInputPara("@emp_account_type", emp_account_type));
            cmd.Parameters.Add(p.StringInputPara("@emp_branch_name", emp_branch_name));
            cmd.Parameters.Add(p.StringInputPara("@emp_upi_id", emp_upi_id));
            cmd.Parameters.Add(p.IntInputPara("@emp_status", emp_status));

            return CreateCommand.ExecuteQuery(cmd);
        }

        // ── SELECT ALL / BY ID ─────────────────────────────────────────────────
        public static DataTable i_pi_employee_mst_select_all_and_id(int emp_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_employee_mst_select_all_and_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.IntInputPara("@emp_id", emp_id));
            return CreateCommand.ExecuteQuery(cmd);
        }

        // ── DELETE ─────────────────────────────────────────────────────────────
        public static DataTable i_pi_employee_mst_delete(int emp_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_employee_mst_delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.IntInputPara("@emp_id", emp_id));
            return CreateCommand.ExecuteQuery(cmd);
        }

        // ── EMPLOYEE DDL ───────────────────────────────────────────────────────
        public static DataTable i_pi_get_all_employee_ddl(string SearchTerm, int exclude_emp_id)
       {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_get_all_employee_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.StringInputPara("@SearchTerm", SearchTerm));
            cmd.Parameters.Add(p.IntInputPara("@exclude_emp_id", exclude_emp_id));
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }

        // ── DESIGNATION DDL (filtered by dept) ────────────────────────────────
        public static DataTable i_pi_get_all_designation_ddl_using_dept_id(string SearchTerm, int dept_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_get_all_designation_ddl_using_dept_id";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.StringInputPara("@SearchTerm", SearchTerm));
            cmd.Parameters.Add(p.IntInputPara("@dept_id", dept_id));
            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable i_pi_get_employee_ddl(string SearchTerm)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter p = new CreateParameter();
            cmd.CommandText = "i_pi_get_employee_ddl";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(p.StringInputPara("@SearchTerm", SearchTerm)); 
            DataTable dt = CreateCommand.ExecuteQuery(cmd);
            return dt;
        }
    }
}