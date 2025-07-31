using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal.Repositories;

public interface IResourceRepository
{
    Task<Resource> CreateResourceAsync(Resource resource);
    Task<Resource?> GetResourceByIdAsync(Guid id);
    Task<List<Resource>> GetActiveResourcesAsync();
    Task<List<Resource>> GetArchivedResourcesAsync();
    Task<bool> IsResourceExistAsync(string resourceName);
    Task<bool> IsResourceHasIncludesByIdAsync(Guid id);
    void UpdateResource(Resource resource);
    void DeleteResource(Resource resource);
}

public class ResourceRepository(
    StorageDbContext _dbContext) : IResourceRepository
{
    public async Task<Resource> CreateResourceAsync(Resource resource)
        => (await _dbContext.Resources
        .AddAsync(resource)).Entity;

    public async Task<Resource?> GetResourceByIdAsync(Guid id)
        => await _dbContext.Resources
        .AsNoTracking()
        .Where(e => e.Id.Equals(id))
        .Select(e => e)
        .FirstOrDefaultAsync();

    public async Task<List<Resource>> GetActiveResourcesAsync()
        => await _dbContext.Resources
        .AsNoTracking()
        .Where(e => e.IsArchived == false)
        .Select(e => e)
        .ToListAsync();

    public async Task<List<Resource>> GetArchivedResourcesAsync()
        => await _dbContext.Resources
        .AsNoTracking()
        .Where(e => e.IsArchived == true)
        .Select(e => e)
        .ToListAsync();

    public async Task<bool> IsResourceExistAsync(string resourceName)
        => await _dbContext.Resources
        .AsNoTracking()
        .AnyAsync(e => e.Name.Equals(resourceName));

    public async Task<bool> IsResourceHasIncludesByIdAsync(Guid id)
    {
        var firstCheck = await _dbContext.Balances
            .AnyAsync(e => e.ResourceId.Equals(id));

        var secondCheck = await _dbContext.ReceiptResources
            .AnyAsync(e => e.ResourceId.Equals(id));

        var thirdCheck = await _dbContext.ShipmentResources
            .AnyAsync(e => e.ResourceId.Equals(id));

        if (firstCheck || secondCheck || thirdCheck)
        {
            return true;
        }

        return false;
    }

    public void UpdateResource(Resource resource)
        => _dbContext.Resources.Update(resource);

    public void DeleteResource(Resource resource)
        => _dbContext.Resources.Remove(resource);
}
