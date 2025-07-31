namespace StorageManagerServer.Dal.Repositories;

public interface IBalanceRepository
{

}

public class BalanceRepository(
    StorageDbContext _dbContext) : IBalanceRepository
{
}
