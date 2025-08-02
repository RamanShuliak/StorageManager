using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Api.Filters;
using StorageManagerServer.Dal;
using StorageManagerServer.Services;
using StorageManagerServer.Services.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();

builder.Services.AddDbContext<StorageDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services
    .AddControllers(options =>
    {
        options.Filters.Add<ApiExceptionFilter>();
    });

builder.Services.AddServices();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<StorageDbContext>();
    try
    {
        await dbContext.Database.MigrateAsync();
        await DataSeeder.SeedDatabase(dbContext);
    }
    catch (Exception ex)
    {
        await LogService.WriteErrorLogAsync($"StorageManagerServer can't migrate data to PostgreSQL.\n{ex.Message}\nPlease, click any button to close program.\n");
        Console.ReadLine();

        Environment.Exit(1);
    }
    await LogService.WriteInformationLogAsync("Migrations to database completed successful.\n");
    await LogService.WriteInformationLogAsync("StorageManagerServer is ready to work.");
    await LogService.WriteInformationLogAsync("Go to URL https://localhost:7285/swagger/index.html to work with Swagger Api.\n");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();


app.MapControllers();

app.Run();
