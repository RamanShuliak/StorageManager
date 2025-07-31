namespace StorageManagerServer.Dal.Repositories;

public interface IShipmentDocumentRepository
{

}

public class ShipmentDocumentRepository(
    StorageDbContext _dbContext) : IShipmentDocumentRepository
{
}
