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

        var document = _mapper.Map<ShipmentDocument>(rqModel);

        await _uoW.ShipmentDocuments.CreateDocumentAsync(document);

        return await _uoW.SaveChangesAsync();
    }

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

        var updatedDate = DateTime.UtcNow;

        var changeBalanceDtoList = new List<ChangeBalanceDto>();

        foreach (var rr in rqModel.CreateResources)
            changeBalanceDtoList.Add(await CreateResourceAsync(rr, document.Id));

        foreach (var rr in rqModel.UpdateResources)
            changeBalanceDtoList.AddRange(await UpdateResourceAsync(rr, updatedDate));

        foreach (var ri in rqModel.DeleteResourceIds)
            changeBalanceDtoList.Add(await DeleteResourceByIdAsync(ri));

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
        Guid documentId)
    {
        var resources = await _uoW.ShipmentResources.GetResourceListBuDocumentIdAsync(documentId);

        var dtoList = new List<ChangeBalanceDto>();

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

        return dtoList;
    }
    #endregion
}
