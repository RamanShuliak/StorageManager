using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal.Repositories;

public interface IClientRepository
{
    Task<Client> CreateClientAsync(Client client);
    Task<Client?> GetClientByIdAsync(Guid id);
    Task<List<Client>> GetActiveClientsAsync();
    Task<List<Client>> GetArchivedClientsAsync();
    Task<bool> IsClientExistByNameAsync(string clientName);
    Task<bool> IsClientExistByIdAsync(Guid id);
    Task<bool> IsClientHasIncludesByIdAsync(Guid id);
    void UpdateClient(Client client);
    void DeleteClient(Client client);
}

public class ClientRepository(
    StorageDbContext _dbContext) : IClientRepository
{
    public async Task<Client> CreateClientAsync(Client client)
        => (await _dbContext.Clients
        .AddAsync(client)).Entity;

    public async Task<Client?> GetClientByIdAsync(Guid id)
        => await _dbContext.Clients
        .AsNoTracking()
        .Where(c => c.Id.Equals(id))
        .Select(c => c)
        .FirstOrDefaultAsync();

    public async Task<List<Client>> GetActiveClientsAsync()
        => await _dbContext.Clients
        .AsNoTracking()
        .Where(c => c.IsArchived == false)
        .Select(c => c)
        .ToListAsync();

    public async Task<List<Client>> GetArchivedClientsAsync()
        => await _dbContext.Clients
        .AsNoTracking()
        .Where(c => c.IsArchived == true)
        .Select(c => c)
        .ToListAsync();

    public async Task<bool> IsClientExistByNameAsync(string clientName)
        => await _dbContext.Clients
        .AsNoTracking()
        .AnyAsync(c => c.Name.Equals(clientName));

    public async Task<bool> IsClientExistByIdAsync(Guid id)
        => await _dbContext.Clients
        .AsNoTracking()
        .AnyAsync(c => c.Id.Equals(id));

    public async Task<bool> IsClientHasIncludesByIdAsync(Guid id)
        => await _dbContext.ShipmentDocuments
        .AnyAsync(sd => sd.ClientId.Equals(id));

    public void UpdateClient(Client client)
        => _dbContext.Clients.Update(client);

    public void DeleteClient(Client client)
        => _dbContext.Clients.Remove(client);
}
