using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using PositionStore.Models;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Cubes") ?? "Data Source=Cubes.db";

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSqlite<CubeDbContext>(connectionString);

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CubeStore API",
        Description = "Managing cubes on a canvas",
        Version = "v1"
    });
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CubeStore API V1");
});

app.UseCors();

app.MapGet("/", () => "Hello World!");

app.MapGet("/cubes", async (CubeDbContext db) => await db.Cubes.ToListAsync());

app.MapGet("/cube/{id}", async (CubeDbContext db, int id) =>
{
    var cube = await db.Cubes.FindAsync(id);
    return cube is not null ? Results.Ok(cube) : Results.NotFound();
});

app.MapPost("/cube", async (CubeDbContext db, Cube cube) =>
{
    await db.Cubes.AddAsync(cube);
    await db.SaveChangesAsync();
    return Results.Created($"/cube/{cube.Id}", cube);
});

app.MapPut("/cube/{id}", async (CubeDbContext db, int id, Cube updatedCube) =>
{
    var cube = await db.Cubes.FindAsync(id);
    if (cube is null) return Results.NotFound();

    cube.CaseName = updatedCube.CaseName;
    cube.Width = updatedCube.Width;
    cube.Height = updatedCube.Height;
    cube.Length = updatedCube.Length;  // Corrected from Depth to Length
    cube.Mass = updatedCube.Mass;

    await db.SaveChangesAsync();
    return Results.Ok(cube);
});

app.MapDelete("/cube/{id}", async (CubeDbContext db, int id) =>
{
    var cube = await db.Cubes.FindAsync(id);
    if (cube is null) return Results.NotFound();

    db.Cubes.Remove(cube);
    await db.SaveChangesAsync();
    return Results.Ok(cube);
});

app.MapDelete("/cubes", async (CubeDbContext db) =>
{
    try
    {
        db.Cubes.RemoveRange(db.Cubes);
        await db.SaveChangesAsync();
        return Results.Ok("All cubes deleted successfully");
    }
    catch (Exception ex)
    {
        return Results.BadRequest("Failed to delete cubes: " + ex.Message);
    }
});

app.Run();
