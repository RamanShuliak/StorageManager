using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal.Repositories;

public interface IMeasureRepository
{
    Task<Measure> CreateMeasureAsync(Measure measure);
    Task<Measure?> GetMeasureByIdAsync(Guid id);
    Task<List<Measure>> GetActiveMeasuresAsync();
    Task<List<Measure>> GetArchivedMeasuresAsync();
    Task<bool> IsMeasureExistByNameAsync(string measureName);
    Task<bool> IsMeasureExistByIdAsync(Guid id);
    Task<bool> IsMeasureHasIncludesByIdAsync(Guid id);
    void UpdateMeasure(Measure measure);
    void DeleteMeasure(Measure measure);
}

public class MeasureRepository(
    StorageDbContext _dbContext) : IMeasureRepository
{
    public async Task<Measure> CreateMeasureAsync(Measure measure)
     => (await _dbContext.Measures
     .AddAsync(measure)).Entity;

    public async Task<Measure?> GetMeasureByIdAsync(Guid id)
        => await _dbContext.Measures
        .AsNoTracking()
        .Where(e => e.Id.Equals(id))
        .Select(e => e)
        .FirstOrDefaultAsync();

    public async Task<List<Measure>> GetActiveMeasuresAsync()
        => await _dbContext.Measures
        .AsNoTracking()
        .Where(e => e.IsArchived == false)
        .Select(e => e)
        .ToListAsync();

    public async Task<List<Measure>> GetArchivedMeasuresAsync()
        => await _dbContext.Measures
        .AsNoTracking()
        .Where(e => e.IsArchived == true)
        .Select(e => e)
        .ToListAsync();

    public async Task<bool> IsMeasureExistByNameAsync(string measureName)
        => await _dbContext.Measures
        .AsNoTracking()
        .AnyAsync(e => e.Name.Equals(measureName));

    public async Task<bool> IsMeasureExistByIdAsync(Guid id)
        => await _dbContext.Measures
        .AsNoTracking()
        .AnyAsync(e => e.Id.Equals(id));

    public async Task<bool> IsMeasureHasIncludesByIdAsync(Guid id)
    {
        var firstCheck = await _dbContext.Balances
            .AnyAsync(e => e.MeasureId.Equals(id));

        var secondCheck = await _dbContext.ReceiptResources
            .AnyAsync(e => e.MeasureId.Equals(id));

        var thirdCheck = await _dbContext.ShipmentResources
            .AnyAsync(e => e.MeasureId.Equals(id));

        if (firstCheck || secondCheck || thirdCheck)
        {
            return true;
        }

        return false;
    }

    public void UpdateMeasure(Measure measure)
        => _dbContext.Measures.Update(measure);

    public void DeleteMeasure(Measure measure)
        => _dbContext.Measures.Remove(measure);
}
