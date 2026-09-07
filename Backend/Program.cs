using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =======================
// Vercel PORT Configuration (IMPORTANT!)
// =======================
Console.WriteLine("=== API STARTING ===");
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// =======================
// Services
// =======================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =======================
// JWT
// =======================
var jwtKey = builder.Configuration["JwtSettings:SecretKey"];
var issuer = builder.Configuration["JwtSettings:Issuer"];
var audience = builder.Configuration["JwtSettings:Audience"];

// Fix possible null warning
var keyBytes = Encoding.UTF8.GetBytes(jwtKey ?? "");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// =======================
// CORS (Vercel + Local)
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()      // Vercel mate
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// =======================
// Enable Swagger
// =======================
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Patel Industries");
    c.RoutePrefix = "swagger";
});

// Vercel ma HTTPS redirection off (Vercel handles SSL)
// app.UseHttpsRedirection();  // Comment out for Vercel

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// =======================
// Static Uploads
// =======================
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseStaticFiles();

app.MapControllers();

app.Run();