using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;

namespace StorageManagerServer.Dal.Repositories;

public interface IReceiptDocumentRepository
{
    Task<ReceiptDocument> CreateDocumentAsync(ReceiptDocument document);
    Task<ReceiptDocument?> GetDocumentWithIncludesByIdAsync(Guid id);
    Task<ReceiptDocumentRsModel?> GetDocumentWithAllIncludesByIdAsync(Guid id);
    Task<List<ReceiptDocumentRsModel>> GetDocumentListWithAllIncludesByParamsAsync(
            GetDocumentListByParamsRqModel rqModel);
    Task<ReceiptDocument?> GetDocumentByIdAsync(Guid id);
    Task<bool> IsDocumentExistByNumberAsync(string docNumber);
    void UpdateDocument(ReceiptDocument document);
    void DeleteDocument(ReceiptDocument document);
}

public class ReceiptDocumentRepository(
    StorageDbContext _dbContext) : IReceiptDocumentRepository
{
    public async Task<ReceiptDocument> CreateDocumentAsync(ReceiptDocument document)
        => (await _dbContext.ReceiptDocuments
        .AddAsync(document)).Entity;

    public async Task<ReceiptDocument?> GetDocumentWithIncludesByIdAsync(Guid id)
        => await _dbContext.ReceiptDocuments
        .Where(e => e.Id.Equals(id))
        .Include(e => e.ReceiptResources)
        .FirstOrDefaultAsync();

    public async Task<ReceiptDocumentRsModel?> GetDocumentWithAllIncludesByIdAsync(Guid id)
        => await _dbContext.ReceiptDocuments
        .AsNoTracking()
        .Where(doc => doc.Id.Equals(id))
        .Select(doc => new ReceiptDocumentRsModel
        {
            Id = doc.Id,
            Number = doc.Number,
            ReceiptDate = doc.ReceiptDate,
            Resources = doc.ReceiptResources
                .Select(rr => new ReceiptResourceRsModel
                {
                    Id = rr.Id,
                    Amount = rr.Amount,
                    ResourceId = rr.ResourceId,
                    ResourceName = rr.Resource!.Name,
                    MeasureId = rr.MeasureId,
                    MeasureName = rr.Measure!.Name
                })
                .ToList()
        })
        .FirstOrDefaultAsync();

    public async Task<List<ReceiptDocumentRsModel>> GetDocumentListWithAllIncludesByParamsAsync(
        GetDocumentListByParamsRqModel rqModel)
    {
        var query = _dbContext.ReceiptDocuments
            .AsNoTracking()
            .AsQueryable();

        if (rqModel.DocNumbers.Any())
            query = query.Where(d => rqModel.DocNumbers.Any(n => d.Number.Contains(n)));

        if (rqModel.ReceiptFromDate.HasValue)
            query = query.Where(d => d.ReceiptDate >= rqModel.ReceiptFromDate.Value);

        if (rqModel.ReceiptToDate.HasValue)
            query = query.Where(d => d.ReceiptDate <= rqModel.ReceiptToDate.Value);

        if (rqModel.ResourceIds.Any())
            query = query.Where(d => d.ReceiptResources
            .Any(rr => rqModel.ResourceIds.Contains(rr.ResourceId)));

        if (rqModel.MeasureIds.Any())
            query = query.Where(d => d.ReceiptResources
            .Any(rr => rqModel.MeasureIds.Contains(rr.MeasureId)));

        return await query
            .Select(doc => new ReceiptDocumentRsModel
            {
                Id = doc.Id,
                Number = doc.Number,
                ReceiptDate = doc.ReceiptDate,
                Resources = doc.ReceiptResources
                    .Select(rr => new ReceiptResourceRsModel
                    {
                        Id = rr.Id,
                        Amount = rr.Amount,
                        ResourceId = rr.ResourceId,
                        ResourceName = rr.Resource!.Name,
                        MeasureId = rr.MeasureId,
                        MeasureName = rr.Measure!.Name
                    })
                    .ToList()
            })
            .ToListAsync();
    }


    public async Task<ReceiptDocument?> GetDocumentByIdAsync(Guid id)
        => await _dbContext.ReceiptDocuments
        .Where(e => e.Id.Equals(id))
        .FirstOrDefaultAsync();

    public async Task<bool> IsDocumentExistByNumberAsync(string docNumber)
        => await _dbContext.ReceiptDocuments
        .AnyAsync(e => e.Number.Equals(docNumber));

    public void UpdateDocument(ReceiptDocument document)
        => _dbContext.ReceiptDocuments.Update(document);

    public void DeleteDocument(ReceiptDocument document)
        => _dbContext.ReceiptDocuments.Remove(document);
}
