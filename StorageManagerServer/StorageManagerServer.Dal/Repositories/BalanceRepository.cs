using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;

namespace StorageManagerServer.Dal.Repositories;

public interface IBalanceRepository
{
    Task<Balance> CreateBalanceAsync(Balance balance);
    Task<Balance?> GetBalanceByParamsAsync(
        Guid resourceId,
        Guid measureId);
    Task<List<BalanceRsModel>> GetBalanceListByParamsAsync(
            GetBalanceListByParamsRqModel rqModel);
    void UpdateBalance(Balance balance);
    void DeleteBalance(Balance balance);
}

public class BalanceRepository(
    StorageDbContext _dbContext) : IBalanceRepository
{
    public async Task<Balance> CreateBalanceAsync(Balance balance)
        => (await _dbContext.Balances
        .AddAsync(balance)).Entity;

    public async Task<Balance?> GetBalanceByParamsAsync(
        Guid resourceId,
        Guid measureId)
        => await _dbContext.Balances
        .Where(e => e.ResourceId.Equals(resourceId))
        .Where(e => e.MeasureId.Equals(measureId))
        .Select(e => e)
        .FirstOrDefaultAsync();

    public async Task<List<BalanceRsModel>> GetBalanceListByParamsAsync(
        GetBalanceListByParamsRqModel rqModel)
    {
        IQueryable<Balance> query = _dbContext.Balances.AsNoTracking();

        if (rqModel.ResourceIds?.Any() == true)
            query = query.Where(b => rqModel.ResourceIds.Contains(b.ResourceId));

        if (rqModel.MeasureIds?.Any() == true)
            query = query.Where(b => rqModel.MeasureIds.Contains(b.MeasureId));

        return await query
            .Select(b => new BalanceRsModel
            {
                Amount = b.Amount,
                ResourceName = b.Resource!.Name,
                MeasureName = b.Measure!.Name
            })
            .ToListAsync();
    }


    public void UpdateBalance(Balance balance)
        => _dbContext.Balances.Update(balance);

    public void DeleteBalance(Balance balance)
        => _dbContext.Balances.Remove(balance);
}
