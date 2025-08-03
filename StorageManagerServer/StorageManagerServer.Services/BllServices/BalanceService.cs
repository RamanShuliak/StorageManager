using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Domain.Dtos;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Services.BllServices;

public interface IBalanceService
{
    Task<List<BalanceRsModel>> GetBalanceListByParamsAsync(
            GetBalanceListByParamsRqModel rqModel);
    Task<Balance> IncreaseBalanceAsync(UpdateBalanceDto dto);
    Task<Balance> ReduceBalanceAsync(UpdateBalanceDto dto);
    Task<int> ChangeBalanceListAsync(List<ChangeBalanceDto> dtoList);
}

public class BalanceService(
    IUnitOfWork _uoW) : IBalanceService
{
    public async Task<List<BalanceRsModel>> GetBalanceListByParamsAsync(
        GetBalanceListByParamsRqModel rqModel)
        => await _uoW.Balances.GetBalanceListByParamsAsync(rqModel);

    public async Task<Balance> IncreaseBalanceAsync(UpdateBalanceDto dto)
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

        return balance;
    }

    public async Task<Balance> ReduceBalanceAsync(UpdateBalanceDto dto)
    {
        var balance = await _uoW.Balances.GetBalanceByParamsAsync(
            dto.ResourceId,
            dto.MeasureId);

        if (balance == null)
            throw new BalanceNotFoundException(dto.ResourceId, dto.MeasureId);
        else
        {
            balance.Amount -= dto.Amount;

            if (balance.Amount < 0)
                throw new NegativeBalanceException(dto.ResourceId, dto.MeasureId);

            else if (balance.Amount == 0)
            {
                _uoW.Balances.DeleteBalance(balance);
            }
            else
            {
                _uoW.Balances.UpdateBalance(balance);
            }
        }

        return balance;
    }

    public async Task<int> ChangeBalanceListAsync(List<ChangeBalanceDto> dtoList)
    {
        var groupedChanges = dtoList
            .GroupBy(x => new { x.ResourceId, x.MeasureId })
            .Select(g => new
            {
                g.Key.ResourceId,
                g.Key.MeasureId,
                TotalChange = g.Sum(x => x.AmountChange)
            })
            .ToList();

        int processedGroups = 0;

        foreach (var group in groupedChanges)
        {
            if (group.TotalChange == 0)
                continue;

            var updateDto = new UpdateBalanceDto
            {
                ResourceId = group.ResourceId,
                MeasureId = group.MeasureId,
                Amount = Math.Abs(group.TotalChange)
            };

            if (group.TotalChange < 0)
            {
                await ReduceBalanceAsync(updateDto);
            }
            else
            {
                await IncreaseBalanceAsync(updateDto);
            }

            processedGroups++;
        }

        return processedGroups;
    }
}
