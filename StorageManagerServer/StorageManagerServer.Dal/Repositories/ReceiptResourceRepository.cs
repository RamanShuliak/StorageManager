using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal.Repositories;

public interface IReceiptResourceRepository
{
    Task<ReceiptResource> CreateResourceAsync(ReceiptResource resource);
    Task<ReceiptResource?> GetResourceByIdAsync(Guid id);
    void UpdateResource(ReceiptResource resource);
    void DeleteResource(ReceiptResource resource);
}

public class ReceiptResourceRepository(
    StorageDbContext _dbContext) : IReceiptResourceRepository
{
    public async Task<ReceiptResource> CreateResourceAsync(ReceiptResource resource)
        => (await _dbContext.ReceiptResources
        .AddAsync(resource)).Entity;

    public async Task<ReceiptResource?> GetResourceByIdAsync(Guid id)
        => await _dbContext.ReceiptResources
        .Where(e => e.Id.Equals(id))
        .FirstOrDefaultAsync();

    public void UpdateResource(ReceiptResource resource)
        => _dbContext.ReceiptResources.Update(resource);

    public void DeleteResource(ReceiptResource resource)
        => _dbContext.ReceiptResources.Remove(resource);
}
