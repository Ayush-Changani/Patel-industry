using Backend.DAL;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Backend.Export.BAl
{
    public class BAL_Invoice_pdf
    {
        public static DataTable i_pi_generate_pdf_for_invoice(int pinv_id)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "i_pi_generate_pdf_for_invoice";
            cmd.CommandType = CommandType.StoredProcedure;

            CreateParameter para = new CreateParameter();
            cmd.Parameters.Add(para.IntInputPara("@pinv_id", pinv_id));

            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}