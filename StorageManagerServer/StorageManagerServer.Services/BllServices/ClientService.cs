using AutoMapper;
using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Services.BllServices;

public interface IClientService
{
    Task<ClientRsModel> CreateClientAsync(CreateClientRqModel rqModel);
    Task<ClientRsModel> GetClientByIdAsync(Guid id);
    Task<List<ClientRsModel>> GetActiveClientsAsync();
    Task<List<ClientRsModel>> GetArchivedClientsAsync();
    Task<ClientRsModel> UpdateClientAsync(UpdateClientRqModel rqModel);
    Task<int> UpdateClientStateByIdAsync(Guid id);
    Task<int> DeleteClientByIdAsync(Guid id);
}

public class ClientService(
    IUnitOfWork _uoW,
    IMapper _mapper) : IClientService
{
    public async Task<ClientRsModel> CreateClientAsync(CreateClientRqModel rqModel)
    {
        var isClientExist = await _uoW.Clients.IsClientExistAsync(rqModel.Name);

        if (isClientExist)
        {
            throw new EntityAlreadyExistsException($"Client with Name = {rqModel.Name} is already exist");
        }

        var client = _mapper.Map<Client>(rqModel);

        var result = await _uoW.Clients.CreateClientAsync(client);

        await _uoW.SaveChangesAsync();

        var rsModel = _mapper.Map<ClientRsModel>(client);

        return rsModel;
    }

    public async Task<ClientRsModel> GetClientByIdAsync(Guid id)
    {
        var client = await _uoW.Clients.GetClientByIdAsync(id);

        if (client == null)
        {
            throw new EntityNotFoundException($"There is no Client with Id = {id} ib data base");
        }

        var rsModel = _mapper.Map<ClientRsModel>(client);

        return rsModel;
    }

    public async Task<List<ClientRsModel>> GetActiveClientsAsync()
    {
        var clients = await _uoW.Clients.GetActiveClientsAsync();

        var activeClients = new List<ClientRsModel>();

        foreach (var client in clients)
        {
            var rsModel = _mapper.Map<ClientRsModel>(client);
            activeClients.Add(rsModel);
        }

        return activeClients;
    }

    public async Task<List<ClientRsModel>> GetArchivedClientsAsync()
    {
        var clients = await _uoW.Clients.GetArchivedClientsAsync();

        var activeClients = new List<ClientRsModel>();

        foreach (var client in clients)
        {
            var rsModel = _mapper.Map<ClientRsModel>(client);
            activeClients.Add(rsModel);
        }

        return activeClients;
    }

    public async Task<ClientRsModel> UpdateClientAsync(UpdateClientRqModel rqModel)
    {
        var client = await _uoW.Clients.GetClientByIdAsync(rqModel.Id);

        if (client == null)
        {
            throw new EntityNotFoundException($"There is no Client with Id = {rqModel.Id} in data base");
        }

        client.Name = rqModel.Name;
        client.Address = rqModel.Address;
        client.UpdatedDate = DateTime.UtcNow;

        _uoW.Clients.UpdateClient(client);
        await _uoW.SaveChangesAsync();

        var rsModel = _mapper.Map<ClientRsModel>(client);

        return rsModel;
    }

    public async Task<int> UpdateClientStateByIdAsync(Guid id)
    {
        var client = await _uoW.Clients.GetClientByIdAsync(id);

        if (client == null)
        {
            throw new EntityNotFoundException($"There is no Client with Id = {id} in data base");
        }

        if (client.IsArchived)
        {
            client.IsArchived = false;
        }
        else
        {
            client.IsArchived = true;
        }

        client.UpdatedDate = DateTime.UtcNow;

        _uoW.Clients.UpdateClient(client);
        var result = await _uoW.SaveChangesAsync();

        return result;
    }

    public async Task<int> DeleteClientByIdAsync(Guid id)
    {
        var client = await _uoW.Clients.GetClientByIdAsync(id);

        if (client == null)
        {
            throw new EntityNotFoundException($"There is no Client with Id = {id} in data base");
        }

        var isHasIncludes = await _uoW.Clients.IsClientHasIncludesByIdAsync(id);

        if (isHasIncludes)
        {
            throw new EntityHasIncludesException($"Client with Id = {id} is used in the system");
        }

        _uoW.Clients.DeleteClient(client);
        var result = await _uoW.SaveChangesAsync();

        return result;
    }
}
