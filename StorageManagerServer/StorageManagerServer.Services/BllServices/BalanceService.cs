using StorageManagerServer.Dal.Repositories;

namespace StorageManagerServer.Services.BllServices;

public interface IBalanceService
{

}

public class BalanceService(
    IUnitOfWork _uoW) : IBalanceService
{
}
