using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Domain.Dtos;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RsModels;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Services.BllServices;

public interface IBalanceService
{
    Task<List<BalanceRsModel>> GetBalanceListByParamsAsync(
        Guid? resourceId = null,
        Guid? measureId = null);
    Task<int> IncreaseBalanceAsync(UpdateBalanceDto dto);
    Task<int> ReduceBalanceAsync(UpdateBalanceDto dto);
}

public class BalanceService(
    IUnitOfWork _uoW) : IBalanceService
{
    public async Task<List<BalanceRsModel>> GetBalanceListByParamsAsync(
        Guid? resourceId = null,
        Guid? measureId = null)
        => await _uoW.Balances.GetBalanceListByParamsAsync(resourceId, measureId);

    public async Task<int> IncreaseBalanceAsync(UpdateBalanceDto dto)
    {
        var balance = await _uoW.Balances.GetBalanceByParamsAsync(
            dto.ResourceId, 
            dto.MeasureId);

        if (balance == null)
        {
            balance = new Balance()
            {
                Id = Guid.NewGuid(),
                Amount = dto.Amount,
                ResourceId = dto.ResourceId,
                MeasureId = dto.MeasureId,
                CreatedDate = DateTime.UtcNow
            };

            await _uoW.Balances.CreateBalanceAsync(balance);
        }
        else
        {
            balance.Amount += dto.Amount;

            _uoW.Balances.UpdateBalance(balance);
        }

        return await _uoW.SaveChangesAsync();
    }

    public async Task<int> ReduceBalanceAsync(UpdateBalanceDto dto)
    {
        var balance = await _uoW.Balances.GetBalanceByParamsAsync(
            dto.ResourceId,
            dto.MeasureId);

        if (balance == null)
        {
            throw new EntityNotFoundException($"There is no Resource with Id {dto.ResourceId} and Measure with Id {dto.MeasureId} in data base");
        }
        else
        {
            balance.Amount -= dto.Amount;

            if (balance.Amount < 0)
            {
                throw new NegativeBalanceException();
            }
            else if (balance.Amount == 0)
            {
                _uoW.Balances.DeleteBalance(balance);
            }
            else
            {
                _uoW.Balances.UpdateBalance(balance);
            }
        }

        return await _uoW.SaveChangesAsync();
    }
}
