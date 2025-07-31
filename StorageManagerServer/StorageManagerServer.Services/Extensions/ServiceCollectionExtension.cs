using Microsoft.Extensions.DependencyInjection;
using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Services.BllServices;

namespace StorageManagerServer.Services.Extensions;

public static class ServiceCollectionExtension
{
    public static void AddServices(
        this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        services.AddBllServices();
    }

    private static void AddBllServices(
        this IServiceCollection services)
    {
        services.AddScoped<IResourceService, ResourceService>();
        services.AddScoped<IMeasureService, MeasureService>();
        services.AddScoped<IBalanceService, BalanceService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IShipmentService, ShipmentService>();
        services.AddScoped<IReceiptService, ReceiptService>();
    }
}
