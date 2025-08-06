using AutoMapper;
using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Domain.Dtos;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Services.BllServices;

public interface IShipmentService
{
    Task<int> CreateDocumentAsync(CreateShipmentDocumentRqModel rqModel);
    Task<List<string>> GetDocumentNumberListAsync();
    Task<List<ShipmentDocumentRsModel>> GetDocumentListByParamsAsync(
            GetDocumentListByParamsRqModel rqModel);
    Task<ShipmentDocumentRsModel> GetDocumentByIdAsync(Guid id);
    Task<int> UpdateDocumentAsync(UpdateShipmentDocumentRqModel rqModel);
    Task<int> DeleteDocumentByIdAsync(Guid documentId);
}

public class ShipmentService(
    IUnitOfWork _uoW,
    IMapper _mapper,
    IBalanceService _balanceService) : IShipmentService
{
    #region PublicMethods
    public async Task<int> CreateDocumentAsync(CreateShipmentDocumentRqModel rqModel)
    {
        var isDocumentExist = await _uoW.ShipmentDocuments.IsDocumentExistByNumberAsync(rqModel.Number);

        if (isDocumentExist)
            throw new EntityAlreadyExistsException("ShipmentDocument", "Number", rqModel.Number);

        if(!rqModel.Resources.Any())
            throw new EmptyShipmentDocumentException(rqModel.Number);

        await IsClientExistByIdAsync(rqModel.ClientId);

        foreach(var sr in rqModel.Resources)
            await CheckIsResourceAndMeasureExistByIdAsync(sr.ResourceId, sr.MeasureId);

        var document = _mapper.Map<ShipmentDocument>(rqModel);

        await _uoW.ShipmentDocuments.CreateDocumentAsync(document);

        return await _uoW.SaveChangesAsync();
    }

    public async Task<List<string>> GetDocumentNumberListAsync()
        => await _uoW.ShipmentDocuments.GetDocumentNumberListAsync();

    public async Task<List<ShipmentDocumentRsModel>> GetDocumentListByParamsAsync(
        GetDocumentListByParamsRqModel rqModel)
        => await _uoW.ShipmentDocuments.GetDocumentListWithAllIncludesByParamsAsync(rqModel);

    public async Task<ShipmentDocumentRsModel> GetDocumentByIdAsync(Guid id)
    {
        var rsModel = await _uoW.ShipmentDocuments.GetDocumentWithAllIncludesByIdAsync(id);

        if (rsModel == null)
            throw new EntityNotFoundException("ShipmentDocument", "Id", id.ToString());

        return rsModel;
    }

    public async Task<int> UpdateDocumentAsync(UpdateShipmentDocumentRqModel rqModel)
    {
        var document = await _uoW.ShipmentDocuments.GetDocumentByIdAsync(rqModel.Id);

        if (document == null)
            throw new EntityNotFoundException("ShipmentDocument", "Id", rqModel.Id.ToString());

        if (!document.Number.Equals(rqModel.Number))
        {
            var isDocumentExistByNumber = await _uoW.ShipmentDocuments.IsDocumentExistByNumberAsync(rqModel.Number);

            if (isDocumentExistByNumber)
                throw new EntityAlreadyExistsException("ShipmentDocument", "Number", rqModel.Number);
        }

        await IsClientExistByIdAsync(rqModel.ClientId);

        var resourceCount = await _uoW.ShipmentResources.GetResourceCountByDocumentIdAsync(rqModel.Id);

        var updatedDate = DateTime.UtcNow;

        var changeBalanceDtoList = new List<ChangeBalanceDto>();

        foreach (var rr in rqModel.CreateResources)
        {
            changeBalanceDtoList.Add(await CreateResourceAsync(rr, document.Id));
            resourceCount++;
        }

        foreach (var rr in rqModel.UpdateResources)
            changeBalanceDtoList.AddRange(await UpdateResourceAsync(rr, updatedDate));

        foreach (var ri in rqModel.DeleteResourceIds)
        {
            changeBalanceDtoList.Add(await DeleteResourceByIdAsync(ri));
            resourceCount--;
        }

        if (resourceCount <= 0)
            throw new EmptyShipmentDocumentException(rqModel.Number);

        if (rqModel.IsSigned
            && document.IsSigned)
            await _balanceService.ChangeBalanceListAsync(changeBalanceDtoList);

        if(rqModel.IsSigned
            && !document.IsSigned)
        {
            changeBalanceDtoList.AddRange(
                await GetChangeBalanceDtoListFromExistResourceListAsync(document.Id));
            await _balanceService.ChangeBalanceListAsync(changeBalanceDtoList);
        }

        if (!rqModel.IsSigned
            && document.IsSigned)
        {
            changeBalanceDtoList 
                = await GetChangeBalanceDtoListFromExistResourceListAsync(document.Id, true);
            await _balanceService.ChangeBalanceListAsync(changeBalanceDtoList);
        }

        document.Number = rqModel.Number;
        document.ShipmentDate = rqModel.ShipmentDate;
        document.IsSigned = rqModel.IsSigned;
        document.ClientId = rqModel.ClientId;
        document.UpdatedDate = updatedDate;

        _uoW.ShipmentDocuments.UpdateDocument(document);

        return await _uoW.SaveChangesAsync();
    }

    public async Task<int> DeleteDocumentByIdAsync(Guid id)
    {
        var document = await _uoW.ShipmentDocuments.GetDocumentWithIncludesByIdAsync(id);

        if (document == null)
            throw new EntityNotFoundException("ShipmentDocument", "Id", id.ToString());

        if (document.ShipmentResources.Any()
            && document.IsSigned)
        {
            foreach (var rr in document.ShipmentResources)
            {
                var balanceDto = new UpdateBalanceDto()
                {
                    Amount = rr.Amount,
                    ResourceId = rr.ResourceId,
                    MeasureId = rr.MeasureId
                };

                await _balanceService.IncreaseBalanceAsync(balanceDto);
            }
        }

        _uoW.ShipmentDocuments.DeleteDocument(document);

        return await _uoW.SaveChangesAsync();
    }
    #endregion

    #region PrivateMethods
    private async Task<ChangeBalanceDto> CreateResourceAsync(
        CreateShipmentResourceRqModel rqModel,
        Guid documentId)
    {
        await CheckIsResourceAndMeasureExistByIdAsync(rqModel.ResourceId, rqModel.MeasureId);

        var resource = _mapper.Map<ShipmentResource>(rqModel);

        resource.DocumentId = documentId;

        await _uoW.ShipmentResources.CreateResourceAsync(resource);

        var dto = new ChangeBalanceDto()
        {
            AmountChange = 0 - rqModel.Amount,
            ResourceId = rqModel.ResourceId,
            MeasureId = rqModel.MeasureId
        };

        return dto;
    }

    private async Task<List<ChangeBalanceDto>> UpdateResourceAsync(
        UpdateShipmentResourceRqModel rqModel,
        DateTime updatedDate)
    {
        var resource = await _uoW.ShipmentResources.GetResourceByIdAsync(rqModel.Id);

        if (resource == null)
            throw new EntityNotFoundException("ShipmentResource", "Id", rqModel.Id.ToString());

        var dtoList = new List<ChangeBalanceDto>();

        if (resource.MeasureId.Equals(rqModel.MeasureId)
            && resource.ResourceId.Equals(rqModel.ResourceId))
        {
            var dto = new ChangeBalanceDto()
            {
                AmountChange = resource.Amount - rqModel.Amount,
                ResourceId = resource.ResourceId,
                MeasureId = resource.MeasureId
            };

            dtoList.Add(dto);
        }
        else
        {
            await CheckIsResourceAndMeasureExistByIdAsync(rqModel.ResourceId, rqModel.MeasureId);

            var currentBalanceDto = new ChangeBalanceDto()
            {
                AmountChange = resource.Amount,
                ResourceId = resource.ResourceId,
                MeasureId = resource.MeasureId
            };

            var newBalanceDto = new ChangeBalanceDto()
            {
                AmountChange = 0 - rqModel.Amount,
                ResourceId = rqModel.ResourceId,
                MeasureId = rqModel.MeasureId
            };

            dtoList.Add(currentBalanceDto);
            dtoList.Add(newBalanceDto);

            resource.ResourceId = rqModel.ResourceId;
            resource.MeasureId = rqModel.MeasureId;
        }

        resource.Amount = rqModel.Amount;
        resource.UpdatedDate = updatedDate;
        _uoW.ShipmentResources.UpdateResource(resource);

        return dtoList;
    }

    private async Task<ChangeBalanceDto> DeleteResourceByIdAsync(
        Guid id)
    {
        var resource = await _uoW.ShipmentResources.GetResourceByIdAsync(id);

        if (resource == null)
            throw new EntityNotFoundException("ShipmentResource", "Id", id.ToString());

        _uoW.ShipmentResources.DeleteResource(resource);

        var dto = new ChangeBalanceDto()
        {
            AmountChange = resource.Amount,
            ResourceId = resource.ResourceId,
            MeasureId = resource.MeasureId
        };

        return dto;
    }

    private async Task<List<ChangeBalanceDto>> GetChangeBalanceDtoListFromExistResourceListAsync(
        Guid documentId,
        bool? isDocumentUnsigning = false)
    {
        var resources = await _uoW.ShipmentResources.GetResourceListByDocumentIdAsync(documentId);

        var dtoList = new List<ChangeBalanceDto>();

        if (isDocumentUnsigning != null
            && isDocumentUnsigning == true)
        {
            foreach (var sr in resources)
            {
                var dto = new ChangeBalanceDto()
                {
                    AmountChange = sr.Amount,
                    ResourceId = sr.ResourceId,
                    MeasureId = sr.MeasureId
                };

                dtoList.Add(dto);
            }
        }
        else
        {
            foreach (var sr in resources)
            {
                var dto = new ChangeBalanceDto()
                {
                    AmountChange = 0 - sr.Amount,
                    ResourceId = sr.ResourceId,
                    MeasureId = sr.MeasureId
                };

                dtoList.Add(dto);
            }
        }

        return dtoList;
    }

    private async Task<bool> CheckIsResourceAndMeasureExistByIdAsync(
        Guid resourceId,
        Guid measureId)
    {
        var isResourceExist = await _uoW.Resources.IsResourceExistByIdAsync(resourceId);

        if (!isResourceExist)
            throw new EntityNotFoundException("Resource", "Id", resourceId.ToString());

        var isMeasureExist = await _uoW.Measures.IsMeasureExistByIdAsync(measureId);

        if (!isMeasureExist)
            throw new EntityNotFoundException("Measure", "Id", measureId.ToString());

        return true;
    }

    private async Task<bool> IsClientExistByIdAsync(Guid id)
    {
        var isClientExist = await _uoW.Clients.IsClientExistByIdAsync(id);

        if(!isClientExist)
            throw new EntityNotFoundException("Client", "Id", id.ToString());

        return true;
    }
    #endregion
}
