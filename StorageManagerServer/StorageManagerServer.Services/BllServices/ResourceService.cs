using AutoMapper;
using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Services.BllServices;

public interface IResourceService
{
    Task<ResourceRsModel> CreateResourceAsync(string resourceName);
    Task<ResourceRsModel> GetResourceByIdAsync(Guid id);
    Task<List<ResourceRsModel>> GetActiveResourcesAsync();
    Task<List<ResourceRsModel>> GetArchivedResourcesAsync();
    Task<ResourceRsModel> UpdateResourceAsync(UpdateResourceRqModel rqModel);
    Task<int> UpdateResourceStateByIdAsync(Guid id);
    Task<int> DeleteResourceByIdAsync(Guid id);
}

public class ResourceService(
    IUnitOfWork _uoW,
    IMapper _mapper) : IResourceService
{
    public async Task<ResourceRsModel> CreateResourceAsync(string resourceName)
    {
        var isResourceExist = await _uoW.Resources.IsResourceExistByNameAsync(resourceName);

        if (isResourceExist)
        {
            throw new EntityAlreadyExistsException($"resource with Name = {resourceName} is already exist");
        }

        var resource = new Resource()
        {
            Id = Guid.NewGuid(),
            Name = resourceName,
            IsArchived = false,
            CreatedDate = DateTime.UtcNow
        };

        var result = await _uoW.Resources.CreateResourceAsync(resource);

        await _uoW.SaveChangesAsync();

        var rsModel = _mapper.Map<ResourceRsModel>(resource);

        return rsModel;
    }

    public async Task<ResourceRsModel> GetResourceByIdAsync(Guid id)
    {
        var resource = await _uoW.Resources.GetResourceByIdAsync(id);

        if (resource == null)
        {
            throw new EntityNotFoundException($"There is no resource with Id = {id} in data base");
        }

        var rsModel = _mapper.Map<ResourceRsModel>(resource);

        return rsModel;
    }

    public async Task<List<ResourceRsModel>> GetActiveResourcesAsync()
    {
        var resources = await _uoW.Resources.GetActiveResourcesAsync();

        var activeResources = new List<ResourceRsModel>();

        foreach (var resource in resources)
        {
            var rsModel = _mapper.Map<ResourceRsModel>(resource);
            activeResources.Add(rsModel);
        }

        return activeResources;
    }

    public async Task<List<ResourceRsModel>> GetArchivedResourcesAsync()
    {
        var resources = await _uoW.Resources.GetArchivedResourcesAsync();

        var activeResources = new List<ResourceRsModel>();

        foreach (var resource in resources)
        {
            var rsModel = _mapper.Map<ResourceRsModel>(resource);
            activeResources.Add(rsModel);
        }

        return activeResources;
    }

    public async Task<ResourceRsModel> UpdateResourceAsync(UpdateResourceRqModel rqModel)
    {
        var resource = await _uoW.Resources.GetResourceByIdAsync(rqModel.Id);

        if (resource == null)
        {
            throw new EntityNotFoundException($"There is no Resource with Id = {rqModel.Id} in data base");
        }

        resource.Name = rqModel.Name;
        resource.UpdatedDate = DateTime.UtcNow;

        _uoW.Resources.UpdateResource(resource);
        await _uoW.SaveChangesAsync();

        var rsModel = _mapper.Map<ResourceRsModel>(resource);

        return rsModel;
    }

    public async Task<int> UpdateResourceStateByIdAsync(Guid id)
    {
        var resource = await _uoW.Resources.GetResourceByIdAsync(id);

        if (resource == null)
        {
            throw new EntityNotFoundException($"There is no Resource with Id = {id} in data base");
        }

        if (resource.IsArchived)
        {
            resource.IsArchived = false;
        }
        else
        {
            resource.IsArchived = true;
        }

        resource.UpdatedDate = DateTime.UtcNow;

        _uoW.Resources.UpdateResource(resource);
        var result = await _uoW.SaveChangesAsync();

        return result;
    }

    public async Task<int> DeleteResourceByIdAsync(Guid id)
    {
        var resource = await _uoW.Resources.GetResourceByIdAsync(id);

        if (resource == null)
        {
            throw new EntityNotFoundException($"There is no Resource with Id = {id} in data base");
        }

        var isHasIncludes = await _uoW.Resources.IsResourceHasIncludesByIdAsync(id);

        if (isHasIncludes)
        {
            throw new EntityHasIncludesException($"resource with Id = {id} is used in the system");
        }

        _uoW.Resources.DeleteResource(resource);
        var result = await _uoW.SaveChangesAsync();

        return result;
    }
}
