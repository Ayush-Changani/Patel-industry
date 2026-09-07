using Backend.Authorization.BAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Authorization.Controller
{
    [ApiController]
    public class Controller_Authorization : ControllerBase
    {
        private readonly IConfiguration _config;

        public Controller_Authorization(IConfiguration config)
        {
            _config = config;
        }

        #region COMMON RESPONSE MODEL
        public class Msg
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public dynamic Result { get; set; }
        }
        #endregion

        #region DTO
        public class LoginDTO
        {
            public string email { get; set; }
            public string password { get; set; }
        }
        #endregion

        #region PRIVATE: Generate JWT Access Token
        private string GenerateAccessToken(
            int userId, string email, string displayName, string groupName)
        {
            var secret = _config["JwtSettings:SecretKey"]!;
            var issuer = _config["JwtSettings:Issuer"]!;
            var audience = _config["JwtSettings:Audience"]!;
            var expiry = int.Parse(_config["JwtSettings:AccessTokenExpiryMinutes"]!);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("userId",      userId.ToString()),
                new Claim("email",       email),
                new Claim("displayName", displayName),
                new Claim("userGroup",   groupName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiry),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion

        #region PRIVATE: Set HTTP-only Cookie
        private void SetRefreshTokenCookie(string rawToken)
        {
            var expiryHours = int.Parse(_config["CookieSettings:RefreshTokenExpiryHours"]!);
            var cookieName = _config["CookieSettings:CookieName"]!;

            Response.Cookies.Append(cookieName, rawToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(expiryHours)
            });
        }
        #endregion

        #region PRIVATE: Build menu permission list from DataTable
        private List<dynamic> BuildMenuPermissions(DataTable dt)
        {
            // Group menus by master_menu_id so frontend gets a
            // structured master → sub-menu tree
            var masterMenus = new Dictionary<int, dynamic>();

            foreach (DataRow row in dt.Rows)
            {
                int masterMenuId = Convert.ToInt32(row["master_menu_id"]);
                string masterName = Convert.ToString(row["master_menu_name"]);

                if (!masterMenus.ContainsKey(masterMenuId))
                {
                    masterMenus[masterMenuId] = new
                    {
                        master_menu_id = masterMenuId,
                        master_menu_name = masterName,
                        sub_menus = new List<dynamic>()
                    };
                }

                // Add sub-menu with all permission flags
                ((List<dynamic>)masterMenus[masterMenuId].sub_menus).Add(new
                {
                    menu_detail_id = Convert.ToInt32(row["menu_detail_id"]),
                    md_sub_menu_name = Convert.ToString(row["md_sub_menu_name"]),
                    md_page_url_1 = Convert.ToString(row["md_page_url_1"]),
                    md_page_url_2 = Convert.ToString(row["md_page_url_2"]),
                    md_icon = Convert.ToString(row["md_icon"]),
                    can_view = Convert.ToInt32(row["can_view"]),
                    can_add = Convert.ToInt32(row["can_add"]),
                    can_edit = Convert.ToInt32(row["can_edit"]),
                    can_delete = Convert.ToInt32(row["can_delete"]),
                    can_approve = Convert.ToInt32(row["can_approve"]),
                    can_export = Convert.ToInt32(row["can_export"]),
                    can_print = Convert.ToInt32(row["can_print"]),
                });
            }

            return masterMenus.Values.Cast<dynamic>().ToList();
        }
        #endregion

        #region LOGIN
        [HttpPost]
        [Route("i_pi_auth_login")]
        public IActionResult i_pi_auth_login([FromForm] LoginDTO model)
        {
            Msg response = new Msg();
            try
            {
                if (string.IsNullOrEmpty(model.email) || string.IsNullOrEmpty(model.password))
                {
                    response.Status = 0;
                    response.Message = "Email and password are required.";
                    response.Result = null;
                    return Ok(response);
                }

                // Get user from DB by email
                DataTable dt = BAL_Authorization.i_pi_auth_login(model.email);

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid email or password.";
                    response.Result = null;
                    return Ok(response);
                }

                // Verify password
                string storedPassword = Convert.ToString(dt.Rows[0]["usr_password"]);
                bool isValid = storedPassword == model.password;

                if (!isValid)
                {
                    response.Status = 0;
                    response.Message = "Invalid email or password.";
                    response.Result = null;
                    return Ok(response);
                }

                // Read user info
                int userId = Convert.ToInt32(dt.Rows[0]["usr_id"]);
                string email = Convert.ToString(dt.Rows[0]["usr_official_email"]);
                string displayName = Convert.ToString(dt.Rows[0]["usr_display_name"]);
                string groupName = Convert.ToString(dt.Rows[0]["ug_name"]);

                // Generate JWT access token
                string accessToken = GenerateAccessToken(userId, email, displayName, groupName);

                // Generate refresh token + save to DB
                string rawRefreshToken = Guid.NewGuid().ToString("N")
                                       + Guid.NewGuid().ToString("N");
                DateTime expiry = DateTime.UtcNow.AddHours(
                    int.Parse(_config["CookieSettings:RefreshTokenExpiryHours"]!));

                BAL_Authorization.i_pi_refresh_token_insert(userId, rawRefreshToken, expiry);

                // Set refresh token as HTTP-only cookie
                SetRefreshTokenCookie(rawRefreshToken);

                // ── NEW: Fetch menu permissions for this user ──────

                // ── Fetch menu permissions ─────────────────────────
                List<dynamic> menuList = new List<dynamic>();
                bool isAdmin = groupName.Equals("Admin", StringComparison.OrdinalIgnoreCase);

                if (isAdmin)
                {
                    // Admin gets ALL menus
                    DataTable allMenusDt = BAL_Authorization.i_pi_get_all_menus_for_admin();
                    if (allMenusDt != null && allMenusDt.Rows.Count > 0)
                        menuList = BuildAdminMenuPermissions(allMenusDt);
                }
                else
                {
                    // Normal user gets only assigned menus
                    DataTable menuDt = BAL_Authorization.i_pi_get_user_menu_permissions(userId);
                    if (menuDt != null && menuDt.Rows.Count > 0)
                        menuList = BuildMenuPermissions(menuDt);
                }

                response.Status = 1;
                response.Message = "Login successful.";
                response.Result = new
                {
                    userId,
                    accessToken,
                    displayName,
                    userGroup = groupName,
                    isAdmin,
                    menuPermissions = menuList   // ← frontend uses this to build sidebar
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return BadRequest(response);
            }
        }
        #endregion

        #region GET MENU PERMISSIONS (standalone endpoint)
        // Frontend can also call this separately at any time using JWT token
        [HttpGet]
        [Route("i_pi_get_user_menu_permissions")]
        public IActionResult i_pi_get_user_menu_permissions()
        {
            Msg response = new Msg();
            try
            {
                // Read userId from JWT claim
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    response.Status = 0;
                    response.Message = "Unauthorized.";
                    response.Result = null;
                    return Ok(response);
                }

                int userId = int.Parse(userIdClaim.Value);

                DataTable dt = BAL_Authorization.i_pi_get_user_menu_permissions(userId);

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "No menu permissions found for this user.";
                    response.Result = new List<dynamic>();
                    return Ok(response);
                }

                var menuList = BuildMenuPermissions(dt);

                response.Status = 1;
                response.Message = "Success.";
                response.Result = menuList;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return BadRequest(response);
            }
        }
        #endregion

        #region REFRESH TOKEN
        [HttpPost]
        [Route("i_pi_refresh_token_validate")]
        public IActionResult i_pi_refresh_token_validate()
        {
            Msg response = new Msg();
            try
            {
                var cookieName = _config["CookieSettings:CookieName"]!;
                var rawToken = Request.Cookies[cookieName];

                if (string.IsNullOrEmpty(rawToken))
                {
                    response.Status = 0;
                    response.Message = "No refresh token found.";
                    response.Result = null;
                    return Ok(response);
                }

                DataTable dt = BAL_Authorization.i_pi_refresh_token_validate(rawToken);

                if (dt == null || dt.Rows.Count == 0)
                {
                    response.Status = 0;
                    response.Message = "Invalid or expired refresh token.";
                    response.Result = null;
                    return Ok(response);
                }

                string storedToken = Convert.ToString(dt.Rows[0]["rft_token_hash"]);
                bool isValid = storedToken == rawToken;

                if (!isValid)
                {
                    response.Status = 0;
                    response.Message = "Invalid refresh token.";
                    response.Result = null;
                    return Ok(response);
                }

                int userId = Convert.ToInt32(dt.Rows[0]["rft_usr_id"]);
                string email = Convert.ToString(dt.Rows[0]["usr_official_email"]);
                string displayName = Convert.ToString(dt.Rows[0]["usr_display_name"]);
                string groupName = Convert.ToString(dt.Rows[0]["ug_name"]);

                string newAccessToken = GenerateAccessToken(userId, email, displayName, groupName);

                response.Status = 1;
                response.Message = "Token refreshed.";
                response.Result = new { accessToken = newAccessToken };

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return BadRequest(response);
            }
        }
        #endregion

        #region LOGOUT
        [HttpPost]
        [Route("i_pi_auth_logout")]
        public IActionResult i_pi_auth_logout()
        {
            Msg response = new Msg();
            try
            {
                var userIdClaim = User.FindFirst("userId");
                if (userIdClaim == null)
                {
                    response.Status = 0;
                    response.Message = "Unauthorized.";
                    response.Result = null;
                    return Ok(response);
                }

                int userId = int.Parse(userIdClaim.Value);

                BAL_Authorization.i_pi_refresh_token_revoke(userId);
                Response.Cookies.Delete(_config["CookieSettings:CookieName"]!);

                response.Status = 1;
                response.Message = "Logged out successfully.";
                response.Result = null;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.Status = 0;
                response.Message = ex.Message;
                response.Result = null;
                return BadRequest(response);
            }
        }
        #endregion

        private List<dynamic> BuildAdminMenuPermissions(DataTable dt)
        {
            var masterMenus = new Dictionary<int, dynamic>();

            foreach (DataRow row in dt.Rows)
            {
                int masterMenuId = Convert.ToInt32(row["master_menu_id"]);
                string masterName = Convert.ToString(row["master_menu_name"]);

                if (!masterMenus.ContainsKey(masterMenuId))
                {
                    masterMenus[masterMenuId] = new
                    {
                        master_menu_id = masterMenuId,
                        master_menu_name = masterName,
                        sub_menus = new List<dynamic>()
                    };
                }

                ((List<dynamic>)masterMenus[masterMenuId].sub_menus).Add(new
                {
                    menu_detail_id = Convert.ToInt32(row["menu_detail_id"]),
                    md_sub_menu_name = Convert.ToString(row["md_sub_menu_name"]),
                    md_page_url_1 = Convert.ToString(row["md_page_url_1"]),
                    md_page_url_2 = Convert.ToString(row["md_page_url_2"]),
                    md_icon = Convert.ToString(row["md_icon"]),
                    can_view = 1,
                    can_add = 1,
                    can_edit = 1,
                    can_delete = 1,
                    can_approve = 1,
                    can_export = 1,
                    can_print = 1,
                });
            }

            return masterMenus.Values.Cast<dynamic>().ToList();
        }
    }
}