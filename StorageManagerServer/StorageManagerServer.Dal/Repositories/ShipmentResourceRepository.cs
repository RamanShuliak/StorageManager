using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal.Repositories;

public interface IShipmentResourceRepository
{
    Task<ShipmentResource> CreateResourceAsync(ShipmentResource resource);
    Task<ShipmentResource?> GetResourceByIdAsync(Guid id);
    Task<List<ShipmentResource>> GetResourceListBuDocumentIdAsync(Guid id);
    void UpdateResource(ShipmentResource resource);
    void DeleteResource(ShipmentResource resource);
}

public class ShipmentResourceRepository(
    StorageDbContext _dbContext) : IShipmentResourceRepository
{
    public async Task<ShipmentResource> CreateResourceAsync(ShipmentResource resource)
        => (await _dbContext.ShipmentResources
        .AddAsync(resource)).Entity;

    public async Task<ShipmentResource?> GetResourceByIdAsync(Guid id)
        => await _dbContext.ShipmentResources
        .Where(e => e.Id.Equals(id))
        .FirstOrDefaultAsync();

    public async Task<List<ShipmentResource>> GetResourceListBuDocumentIdAsync(Guid id)
        => await _dbContext.ShipmentResources
        .AsNoTracking()
        .Where(e => e.DocumentId.Equals(id))
        .ToListAsync();

    public void UpdateResource(ShipmentResource resource)
        => _dbContext.ShipmentResources.Update(resource);

    public void DeleteResource(ShipmentResource resource)
        => _dbContext.ShipmentResources.Remove(resource);
}
