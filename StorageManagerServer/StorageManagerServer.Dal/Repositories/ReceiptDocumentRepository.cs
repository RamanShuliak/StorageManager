namespace StorageManagerServer.Dal.Repositories;

public interface IReceiptDocumentRepository
{

}

public class ReceiptDocumentRepository(
    StorageDbContext _dbContext) : IReceiptDocumentRepository
{
}
