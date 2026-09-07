using Backend.MenuPermission.BAL;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace Backend.MenuPermission.Controller
{
    [ApiController]
    public class Controller_MenuPermission : ControllerBase
    {
        #region COMMON RESPONSE MODEL
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }
        #endregion

        #region DTOs
        public class MenuPermissionInsertDTO
        {
            public int id { get; set; }
            public string ug_id { get; set; }
            public string usr_id { get; set; }
            public string dept_id { get; set; }
            public int is_active { get; set; }
            public string permissions { get; set; }  // JSON string from frontend
        }

        public class DeleteDTO
        {
            public int id { get; set; }
        }
        #endregion

        [HttpGet]
        [Route("i_pi_menu_permission_select_all")]
        public IActionResult i_pi_menu_permission_select_all([FromQuery] string SearchTerm = "")
        {
            Msg response = new Msg();
            try
            {
                DataTable dt = BAL_MenuPermission.i_pi_menu_permission_select_all(SearchTerm ?? "");

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No records found.";
                    response.Result = null;
                    return Ok(response);
                }

                var list = new List<dynamic>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        // ✅ FIX: SP returns usr_id not id — use usr_id as the identifier
                        id = Convert.ToInt32(row["usr_id"]),
                        usr_id = Convert.ToInt32(row["usr_id"]),
                        usr_name = Convert.ToString(row["usr_name"]),
                        permission_count = Convert.ToInt32(row["permission_count"]),
                        is_active = Convert.ToInt32(row["is_active"]),
                        created_at = Convert.ToString(row["created_at"]),
                    });
                }

                response.Status = 1;
                response.Message = "Success.";
                response.Result = list;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return Ok(response);
            }
        }

        #region SELECT BY ID 
        [HttpGet]
        [Route("i_pi_menu_permission_select_by_usr_id")]
        public IActionResult i_pi_menu_permission_select_by_usr_id([FromQuery] int usr_id)
        {
            Msg response = new Msg();
            try
            {
                if (usr_id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid user ID.";
                    response.Result = null;
                    return Ok(response);
                }

                DataTable dt = BAL_MenuPermission.i_pi_menu_permission_select_by_usr_id(usr_id);
                 
                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 1;
                    response.Message = "No permissions found.";
                    response.Result = new
                    {
                        usr_id = usr_id,
                        is_active = 1,
                        permissions = new List<dynamic>()
                    };
                    return Ok(response);
                }

                DataRow header = dt.Rows[0];

                var permissions = new List<dynamic>();
                foreach (DataRow row in dt.Rows)
                {
                    if (row["menu_detail_id"] != DBNull.Value)
                    {
                        permissions.Add(new
                        {
                            menu_detail_id = Convert.ToInt32(row["menu_detail_id"]),
                            can_view = Convert.ToInt32(row["can_view"]),
                            can_add = Convert.ToInt32(row["can_add"]),
                            can_edit = Convert.ToInt32(row["can_edit"]),
                            can_delete = Convert.ToInt32(row["can_delete"]),
                            can_approve = Convert.ToInt32(row["can_approve"]),
                            can_export = Convert.ToInt32(row["can_export"]),
                            can_print = Convert.ToInt32(row["can_print"]),
                        });
                    }
                }

                var result = new
                {
                    usr_id = Convert.ToInt32(header["usr_id"]),
                    usr_name = Convert.ToString(header["usr_name"]),
                    is_active = Convert.ToInt32(header["is_active"]),
                    permissions = permissions,
                };

                response.Status = 1;
                response.Message = "Success.";
                response.Result = result;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return Ok(response);
            }
        }
        #endregion

        // ─── FIXED: i_pi_menu_permission_insert action ───────────────────────────────
        // Changes:
        //   1. Log all incoming values before calling BAL
        //   2. Fix response key casing (Message vs message — pick one and stick to it)
        //   3. Handle null DataTable gracefully
        //   4. Send "0" default from frontend so TryParse never fails

        [HttpPost]
        [Route("i_pi_menu_permission_insert")]
        public IActionResult i_pi_menu_permission_insert([FromForm] MenuPermissionInsertDTO model)
        {
            Msg response = new Msg();
            try
            {
                // ✅ FIX 1: Debug log — check what the controller actually received
                Console.WriteLine("=== INSERT DEBUG ===");
                Console.WriteLine($"id: {model.id}");
                Console.WriteLine($"usr_id raw: '{model.usr_id}'");
                Console.WriteLine($"ug_id  raw: '{model.ug_id}'");
                Console.WriteLine($"dept_id raw: '{model.dept_id}'");
                Console.WriteLine($"is_active: {model.is_active}");
                Console.WriteLine($"permissions: {model.permissions}");

                int ugId = 0;
                int usrId = 0;
                int deptId = 0;

                int.TryParse(model.ug_id, out ugId);
                int.TryParse(model.usr_id, out usrId);
                int.TryParse(model.dept_id, out deptId);

                Console.WriteLine($"Parsed → ugId:{ugId}  usrId:{usrId}  deptId:{deptId}");

                // ✅ FIX 2: Validate assignee
                if (ugId == 0 && usrId == 0 && deptId == 0)
                {
                    response.Status = 0;
                    response.Message = "Please select a User, Role, or Department.";
                    response.Result = null;
                    return Ok(response);
                }

                // ✅ FIX 3: Validate permissions not empty
                if (string.IsNullOrWhiteSpace(model.permissions) ||
                    model.permissions == "[]")
                {
                    response.Status = 0;
                    response.Message = "Please set at least one permission.";
                    response.Result = null;
                    return Ok(response);
                }

                // ── Call BAL ──────────────────────────────────────────────────────────
                DataTable dt = BAL_MenuPermission.i_pi_menu_permission_insert(
                    model.id,
                    ugId,
                    usrId,
                    deptId,
                    model.is_active,
                    model.permissions
                );

                // ✅ FIX 4: Log what came back from BAL/SP
                Console.WriteLine($"DataTable returned: {(dt == null ? "NULL" : dt.Rows.Count + " rows")}");
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataColumn col in dt.Columns)
                        Console.WriteLine($"  Column: {col.ColumnName}");
                    Console.WriteLine($"  Status:  {dt.Rows[0]["Status"]}");
                    Console.WriteLine($"  Message: {dt.Rows[0]["Message"]}");
                }

                // ✅ FIX 5: Handle SP result properly
                if (dt != null && dt.Rows.Count > 0)
                {
                    int status = Convert.ToInt32(dt.Rows[0]["Status"]);
                    string msg = Convert.ToString(dt.Rows[0]["Message"]);
                    response.Status = status;
                    response.Message = msg;       // ✅ consistent casing — always "Message"
                    response.Result = null;
                    return Ok(response);
                }

                // ✅ FIX 6: If SP returned no rows (ExecuteNonQuery path), 
                //           assume success — but log a warning
                Console.WriteLine("WARNING: SP returned no result rows. Assuming success.");
                response.Status = 1;
                response.Message = model.id > 0 ? "Updated successfully." : "Saved successfully.";
                response.Result = null;
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"EXCEPTION: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return Ok(response);
            }
        }

        #region DELETE
        [HttpPost]
        [Route("i_pi_menu_permission_delete")]
        public IActionResult i_pi_menu_permission_delete([FromForm] DeleteDTO model)
        {
            Msg response = new Msg();
            try
            {
                if (model.id <= 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid ID.";
                    response.Result = null;
                    return Ok(response);
                }

                DataTable dt = BAL_MenuPermission.i_pi_menu_permission_delete(model.id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    int status = Convert.ToInt32(dt.Rows[0]["Status"]);
                    string msg = Convert.ToString(dt.Rows[0]["Message"]);

                    response.Status = status;
                    response.Message = msg;
                    response.Result = null;
                    return Ok(response);
                }

                response.Status = 1;
                response.Message = "Deleted successfully.";
                response.Result = null;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return Ok(response);           // ← ALWAYS return 200, use Status=0 for errors
            }

        }
        #endregion

        //#region SELECT ALL MENUS (tree dropdown)
        //[HttpGet]
        //[Route("i_pi_menu_detail_select_all_and_id")]
        //public IActionResult i_pi_menu_detail_select_all_and_id()
        //{
        //    Msg response = new Msg();
        //    try
        //    {
        //        DataTable dt = BAL_MenuPermission.i_pi_menu_detail_select_all_and_id();

        //        if (dt == null || dt.Rows.Count == 0)
        //        {
        //            response.Status = 0;
        //            response.Message = "No menu records found.";
        //            response.Result = null;
        //            return Ok(response);
        //        }

        //        var list = new List<dynamic>();
        //        foreach (DataRow row in dt.Rows)
        //        {
        //            list.Add(new
        //            {
        //                id = Convert.ToInt32(row["id"]),
        //                md_master_menu_id = Convert.ToInt32(row["md_master_menu_id"]),
        //                master_menu_name = Convert.ToString(row["master_menu_name"]),
        //                md_sub_menu_name = Convert.ToString(row["md_sub_menu_name"]),
        //            });
        //        }

        //        response.Status = 1;
        //        response.Message = "Success.";
        //        response.Result = list;
        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        response.Status = 0;
        //        response.Message = ex.Message;
        //        response.Result = null;
        //        return BadRequest(response);
        //    }
        //}
        //#endregion
    }
}