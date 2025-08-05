using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;

namespace StorageManagerServer.Dal.Repositories;

public interface IShipmentDocumentRepository
{
    Task<ShipmentDocument> CreateDocumentAsync(ShipmentDocument document);
    Task<List<string>> GetDocumentNumberListAsync();
    Task<ShipmentDocument?> GetDocumentWithIncludesByIdAsync(Guid id);
    Task<ShipmentDocumentRsModel?> GetDocumentWithAllIncludesByIdAsync(Guid id);
    Task<List<ShipmentDocumentRsModel>> GetDocumentListWithAllIncludesByParamsAsync(
            GetDocumentListByParamsRqModel rqModel);
    Task<ShipmentDocument?> GetDocumentByIdAsync(Guid id);
    Task<bool> IsDocumentExistByNumberAsync(string docNumber);
    void UpdateDocument(ShipmentDocument document);
    void DeleteDocument(ShipmentDocument document);
}

public class ShipmentDocumentRepository(
    StorageDbContext _dbContext) : IShipmentDocumentRepository
{
    public async Task<ShipmentDocument> CreateDocumentAsync(ShipmentDocument document)
        => (await _dbContext.ShipmentDocuments
        .AddAsync(document)).Entity;

    public async Task<List<string>> GetDocumentNumberListAsync()
        => await _dbContext.ShipmentDocuments
        .AsNoTracking()
        .Select(e => e.Number)
        .ToListAsync();

    public async Task<ShipmentDocument?> GetDocumentWithIncludesByIdAsync(Guid id)
        => await _dbContext.ShipmentDocuments
        .Where(e => e.Id.Equals(id))
        .Include(e => e.ShipmentResources)
        .FirstOrDefaultAsync();

    public async Task<ShipmentDocumentRsModel?> GetDocumentWithAllIncludesByIdAsync(Guid id)
        => await _dbContext.ShipmentDocuments
        .AsNoTracking()
        .Where(doc => doc.Id.Equals(id))
        .Select(doc => new ShipmentDocumentRsModel
        {
            Id = doc.Id,
            Number = doc.Number,
            ShipmentDate = doc.ShipmentDate,
            IsSigned = doc.IsSigned,
            ClientId = doc.ClientId,
            ClientName = doc.Client!.Name,
            Resources = doc.ShipmentResources
                .Select(rr => new ShipmentResourceRsModel
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

    public async Task<List<ShipmentDocumentRsModel>> GetDocumentListWithAllIncludesByParamsAsync(
        GetDocumentListByParamsRqModel rqModel)
    {
        var query = _dbContext.ShipmentDocuments
            .AsNoTracking()
            .AsQueryable();

        if (rqModel.DocNumbers.Any())
            query = query.Where(d => rqModel.DocNumbers.Any(n => d.Number.Contains(n)));

        if (rqModel.FromDate.HasValue)
            query = query.Where(d => d.ShipmentDate >= rqModel.FromDate.Value);

        if (rqModel.ToDate.HasValue)
            query = query.Where(d => d.ShipmentDate <= rqModel.ToDate.Value);

        if (rqModel.ResourceIds.Any())
            query = query.Where(d => d.ShipmentResources
            .Any(rr => rqModel.ResourceIds.Contains(rr.ResourceId)));

        if (rqModel.MeasureIds.Any())
            query = query.Where(d => d.ShipmentResources
            .Any(rr => rqModel.MeasureIds.Contains(rr.MeasureId)));

        return await query
            .Select(doc => new ShipmentDocumentRsModel
            {
                Id = doc.Id,
                Number = doc.Number,
                ShipmentDate = doc.ShipmentDate,
                IsSigned = doc.IsSigned,
                ClientId = doc.ClientId,
                ClientName = doc.Client!.Name,
                Resources = doc.ShipmentResources
                    .Select(rr => new ShipmentResourceRsModel
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

    public async Task<ShipmentDocument?> GetDocumentByIdAsync(Guid id)
        => await _dbContext.ShipmentDocuments
        .Where(e => e.Id.Equals(id))
        .FirstOrDefaultAsync();

    public async Task<bool> IsDocumentExistByNumberAsync(string docNumber)
        => await _dbContext.ShipmentDocuments
        .AnyAsync(e => e.Number.Equals(docNumber));

    public void UpdateDocument(ShipmentDocument document)
        => _dbContext.ShipmentDocuments.Update(document);

    public void DeleteDocument(ShipmentDocument document)
        => _dbContext.ShipmentDocuments.Remove(document);
}
