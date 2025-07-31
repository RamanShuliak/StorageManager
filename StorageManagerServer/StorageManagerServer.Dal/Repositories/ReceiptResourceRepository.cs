namespace StorageManagerServer.Dal.Repositories;

public interface IReceiptResourceRepository
{

}

public class ReceiptResourceRepository(
    StorageDbContext _dbContext) : IReceiptResourceRepository
{
}
