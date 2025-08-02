using AutoMapper;
using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Domain.Dtos;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Services.BllServices;

public interface IReceiptService
{
    Task<int> CreateDocumentAsync(CreateReceiptDocumentRqModel rqModel);
    Task<List<ReceiptDocumentRsModel>> GetDocumentListByParamsAsync(
            GetDocumentListByParamsRqModel rqModel);
    Task<ReceiptDocumentRsModel> GetDocumentByIdAsync(Guid id);
    Task<int> UpdateDocumentAsync(UpdateReceiptDocumentRqModel rqModel);
    Task<int> DeleteDocumentByIdAsync(Guid documentId);
}

public class ReceiptService(
    IUnitOfWork _uoW,
    IMapper _mapper,
    IBalanceService _balanceService) : IReceiptService
{
    #region PublicMethods
    public async Task<int> CreateDocumentAsync(CreateReceiptDocumentRqModel rqModel)
    {
        var isDocumentExist = await _uoW.ReceiptDocuments.IsDocumentExistByNumberAsync(rqModel.Number);

        if (isDocumentExist)
            throw new EntityAlreadyExistsException("ReceiptDocument", "Number", rqModel.Number);

        var document = _mapper.Map<ReceiptDocument>(rqModel);

        await _uoW.ReceiptDocuments.CreateDocumentAsync(document);

        if (rqModel.Resources.Any())
        {
            foreach (var rr in rqModel.Resources)
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

        return await _uoW.SaveChangesAsync();
    }

    public async Task<List<ReceiptDocumentRsModel>> GetDocumentListByParamsAsync(
        GetDocumentListByParamsRqModel rqModel)
        => await _uoW.ReceiptDocuments.GetDocumentListWithAllIncludesByParamsAsync(rqModel);

    public async Task<ReceiptDocumentRsModel> GetDocumentByIdAsync(Guid id)
    {
        var rsModel = await _uoW.ReceiptDocuments.GetDocumentWithAllIncludesByIdAsync(id);

        if (rsModel == null)
            throw new EntityNotFoundException("ReceiptDocument", "Id", id.ToString());

        return rsModel;
    }

    public async Task<int> UpdateDocumentAsync(UpdateReceiptDocumentRqModel rqModel)
    {
        var document = await _uoW.ReceiptDocuments.GetDocumentByIdAsync(rqModel.Id);

        if (document == null)
            throw new EntityNotFoundException("ReceiptDocument", "Id", rqModel.Id.ToString());

        var updatedDate = DateTime.UtcNow;

        foreach (var rr in rqModel.CreateResources)
            await CreateResourceAsync(rr, document.Id);

        foreach (var rr in rqModel.UpdateResources)
            await UpdateResourceAsync(rr, updatedDate);

        foreach(var ri in rqModel.DeleteResourceIds)
            await DeleteResourceByIdAsync(ri);

        document.Number = rqModel.Number;
        document.ReceiptDate = rqModel.ReceiptDate;
        document.UpdatedDate = updatedDate;

        _uoW.ReceiptDocuments.UpdateDocument(document);

        return await _uoW.SaveChangesAsync();
    }

    public async Task<int> DeleteDocumentByIdAsync(Guid id)
    {
        var document = await _uoW.ReceiptDocuments.GetDocumentWithIncludesByIdAsync(id);

        if (document == null)
            throw new EntityNotFoundException("ReceiptDocument", "Id", id.ToString());

        if (document.ReceiptResources.Any())
        {
            foreach (var rr in document.ReceiptResources)
            {
                var balanceDto = new UpdateBalanceDto()
                {
                    Amount = rr.Amount,
                    ResourceId = rr.ResourceId,
                    MeasureId = rr.MeasureId
                };

                await _balanceService.ReduceBalanceAsync(balanceDto);
            }
        }

        _uoW.ReceiptDocuments.DeleteDocument(document);

        return await _uoW.SaveChangesAsync();
    }
    #endregion

    #region PrivateMethods
    private async Task<int> UpdateResourceAsync(
        UpdateReceiptResourceRqModel rqModel,
        DateTime updatedDate)
    {
        var resource = await _uoW.ReceiptResources.GetResourceByIdAsync(rqModel.Id);

        if (resource == null)
            throw new EntityNotFoundException("ReceiptResource", "Id", rqModel.Id.ToString());

        if (resource.MeasureId.Equals(rqModel.MeasureId)
            && resource.ResourceId.Equals(rqModel.ResourceId))
        {
            var balanceDto = new UpdateBalanceDto()
            {
                Amount = 0,
                ResourceId = resource.ResourceId,
                MeasureId = resource.MeasureId
            };

            if (resource.Amount > rqModel.Amount)
            {
                balanceDto.Amount = resource.Amount - rqModel.Amount;

                await _balanceService.ReduceBalanceAsync(balanceDto);
            }
            else
            {
                balanceDto.Amount = rqModel.Amount - resource.Amount;

                await _balanceService.IncreaseBalanceAsync(balanceDto);
            }
        }
        else
        {
            var currentBalanceDto = new UpdateBalanceDto()
            {
                Amount = resource.Amount,
                ResourceId = resource.ResourceId,
                MeasureId = resource.MeasureId
            };

            await _balanceService.ReduceBalanceAsync(currentBalanceDto);

            var newBalanceDto = new UpdateBalanceDto()
            {
                Amount = rqModel.Amount,
                ResourceId = rqModel.ResourceId,
                MeasureId = rqModel.MeasureId
            };

            resource.ResourceId = rqModel.ResourceId;
            resource.MeasureId = rqModel.MeasureId;

            await _balanceService.IncreaseBalanceAsync(newBalanceDto);
        }

        resource.Amount = rqModel.Amount;
        resource.UpdatedDate = updatedDate;
        _uoW.ReceiptResources.UpdateResource(resource);

        return 1;
    }

    private async Task<int> CreateResourceAsync(
        CreateReceiptResourceRqModel rqModel,
        Guid documentId)
    {
        var resource = _mapper.Map<ReceiptResource>(rqModel);

        resource.DocumentId = documentId;

        await _uoW.ReceiptResources.CreateResourceAsync(resource);

        var balanceDto = new UpdateBalanceDto()
        {
            Amount = rqModel.Amount,
            ResourceId = rqModel.ResourceId,
            MeasureId = rqModel.MeasureId
        };

        await _balanceService.IncreaseBalanceAsync(balanceDto);

        return 1;
    }

    private async Task<int> DeleteResourceByIdAsync(
        Guid id)
    {
        var resource = await _uoW.ReceiptResources.GetResourceByIdAsync(id);

        if (resource == null)
            throw new EntityNotFoundException("ReceiptResource", "Id", id.ToString());

        _uoW.ReceiptResources.DeleteResource(resource);

        var balanceDto = new UpdateBalanceDto()
        {
            Amount = resource.Amount,
            ResourceId = resource.ResourceId,
            MeasureId = resource.MeasureId
        };

        await _balanceService.ReduceBalanceAsync(balanceDto);

        return 1;
    }
    #endregion
}
